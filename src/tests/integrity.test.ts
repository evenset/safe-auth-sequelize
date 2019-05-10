import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import faker from 'faker';

import prepare from '.';
const models = prepare();

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    sinon.restore();
});

describe('Normal flow', (): void => {
    it('should be able to create a user and authenticate it' +
        '', async (): Promise<void> => {
        const {SequelizeUser} = models;
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
        const {SequelizeAccessToken, SequelizeUser} = models;
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
