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
    it('Should be able to create a user and authenticate it' +
        '', async (): Promise<void> => {
        const {SequelizeUser} = models;
        const firstUser = new SequelizeUser({username: 'a', password: 'b'});
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.null;
        await firstUser.setPassword('b');
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.null;
        firstUser.isActive = true;
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.null;
        await firstUser.save();
        expect(await SequelizeUser.authenticate('a', 'b'))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .that.is.equal(firstUser.id);

        const secondUser = new SequelizeUser({username: 'c', password: 'd'});
        secondUser.isActive = true;
        await secondUser.setPassword('d');
        expect(await SequelizeUser.authenticate('c', 'd'))
            .to.be.instanceOf(SequelizeUser)
            .and.to.have.property('id')
            .that.is.a('number')
            .that.is.equal(secondUser.id);
    });
});
