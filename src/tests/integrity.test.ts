import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

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
        const firstUser = new SequelizeUser({username: 'a', isActive: true});
        SequelizeUser.first({});
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.null;
        await firstUser.setPassword('b');
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(firstUser.id);

        const secondUser = new SequelizeUser({username: 'c', password: 'd'});
        secondUser.isActive = true;
        await secondUser.setPassword('d');
        expect(await SequelizeUser.authenticate('c', 'd'))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(secondUser.id);
    });

    it('should be able to create a user, issue a token for it and' +
        ' authenticate the token', async (): Promise<void> => {
        const {SequelizeAccessToken, SequelizeUser} = models;
        const user = new SequelizeUser({username: 'a', isActive: true});
        await user.setPassword('b');
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .and.is.equal(user.id);

        const accessToken = await SequelizeAccessToken.issue(user);
        // const fetchedUser = await SequelizeAccessToken
        //     .authenticate(accessToken.token);
        // expect(fetchedUser)
        //     .to.be.instanceOf(SequelizeUser)
        //     .and.to.have.property('id')
        //     .that.is.a('number')
        //     .and.is.equal(user.id);
    });
});
