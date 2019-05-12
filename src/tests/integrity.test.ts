import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import faker from 'faker';
import {DataTypes, Sequelize} from 'sequelize';

import {SequelizeAccessToken, SequelizeUser} from '..';
import prepare from '.';
const models = prepare();

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    sinon.restore();
});

describe('Use models as is', (): void => {
    it('should be able to create a user and authenticate it' +
        '', async (): Promise<void> => {
        const {sequelize} = models;
        SequelizeUser.init({}, {sequelize});
        const firstUsername = faker.internet.userName();
        const firstPassword = faker.internet.password();
        const firstUser = new SequelizeUser({
            username: firstUsername,
            isActive: true,
        });
        expect(await SequelizeUser.authenticate(firstUsername, firstPassword))
            .to.be.null;
        await firstUser.setPassword(firstPassword);
        expect(await SequelizeUser.authenticate(firstUsername, firstPassword))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(firstUser.id);

        const secondUsername = faker.internet.userName();
        const secondPassword = faker.internet.password();
        const secondUser = new SequelizeUser({
            username: secondUsername,
        });
        secondUser.isActive = true;
        await secondUser.setPassword(secondPassword);
        expect(await SequelizeUser.authenticate(secondUsername, secondPassword))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(secondUser.id);
    });

    it('should be able to create a user, issue a token for it and' +
        ' authenticate the token', async (): Promise<void> => {
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const {sequelize} = models;
        SequelizeUser.init({}, {sequelize});
        SequelizeAccessToken.init({}, {sequelize});
        if ((sequelize.Sequelize as any).version.startsWith('5.1'))
            SequelizeAccessToken.associate({
                User: SequelizeUser,
                AccessToken: SequelizeAccessToken,
            });
        else
            SequelizeAccessToken.associate(sequelize.models);
        const user = new SequelizeUser({username, isActive: true});
        await user.setPassword(password);
        expect(await SequelizeUser.authenticate(username, password))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(user.id);

        const accessToken = await SequelizeAccessToken.issue(user);
        const fetchedUser = await SequelizeAccessToken
            .authenticate(accessToken.token);
        expect(fetchedUser)
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(user.id);
    });
});

describe('Inheriting and extending user model', (): void => {
    it('should be able to create a user and authenticate it' +
        '', async (): Promise<void> => {
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const firstname = faker.name.firstName();
        const lastname = faker.name.lastName();
        const {sequelize} = models;

        class User extends SequelizeUser {
            public firstname!: string;
            public lastname!: string;
        }
        User.init({
            firstname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {sequelize});
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('Users', 'firstname', {
            type: DataTypes.STRING,
            allowNull: false,
        });
        await queryInterface.addColumn('Users', 'lastname', {
            type: DataTypes.STRING,
            allowNull: false,
        });

        const user = new User({username, firstname, lastname, isActive: true});
        await user.setPassword(password);
        expect(await User.authenticate(username, password))
            .to.be.instanceOf(User)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(user.id);
    });

    it('should be able to create a user, issue a token for it and' +
        ' authenticate the token', async (): Promise<void> => {
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const firstname = faker.name.firstName();
        const lastname = faker.name.lastName();
        const {sequelize} = models;
        const queryInterface = sequelize.getQueryInterface();

        const SS = Sequelize as any;

        class User extends SequelizeUser {
            public firstname!: string;
            public lastname!: string;
        }
        User.init({
            firstname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {sequelize});
        await queryInterface.addColumn('Users', 'firstname', {
            type: SS.STRING,
            allowNull: false,
        });
        await queryInterface.addColumn('Users', 'lastname', {
            type: SS.STRING,
            allowNull: false,
        });

        class AccessToken extends SequelizeAccessToken {
            public randomField!: number;
            protected static includes = [
                {model: User, foreignKey: 'userId', as: 'user'},
            ]

            public static associate(models: {
                User?: typeof SequelizeUser;
                AccessToken?: typeof SequelizeAccessToken;
            }): void {
                models.AccessToken!.belongsTo(models.User!, {
                    as: 'user',
                    foreignKey: 'userId',
                    targetKey: 'id',
                });
            }
        }
        AccessToken.init({
            randomField: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        }, {sequelize});
        if ((sequelize.Sequelize as any).version.startsWith('5.1'))
            SequelizeAccessToken.associate({User, AccessToken});
        else
            SequelizeAccessToken.associate(sequelize.models);
        await queryInterface.addColumn('AccessTokens', 'randomField', {
            type: SS.INTEGER,
            allowNull: true,
        });

        const user = new User({username, firstname, lastname, isActive: true});
        await user.setPassword(password);
        const accessToken = await AccessToken.issue(user);
        expect(accessToken)
            .to.be.instanceOf(AccessToken)
            .and.to.have.property('id')
            .that.is.a('number');
        expect(accessToken.user)
            .to.be.instanceOf(User)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(user.id);
        const fetchedUser = await AccessToken.authenticate(accessToken.token);
        expect(fetchedUser)
            .to.be.instanceOf(User)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(user.id);

        // expect(await AccessToken.filter({token: 'test'}))
        //     .to.have.length.of(1);
    });
});
