import crypto from 'crypto';
import {
    DataTypes,
    InitOptions,
    Model,
    ModelAttributes,
} from 'sequelize';
import {User, AccessToken} from 'safe-auth';

class ImplementedAccessToken extends AccessToken {
    public id = 1;
    public token = '';
    public refreshToken = '';
    public expires: Date|null = null;
    public user: User = (null as unknown as User);
    protected consumed = false;
    public createdAt = new Date();
    public updatedAt = new Date();

    public remove(): Promise<void> {
        return new Promise((): void => {});
    }

    public save(): Promise<void> {
        return new Promise((): void => {});
    }
}

class ImplementedUser extends User {
    public id = 1;
    public username = '';
    public password = '';
    public isActive = true;
    public createdAt = new Date();
    public updatedAt = new Date();

    public save(): Promise<void> {
        return new Promise((resolve): void => resolve());
    }

    public remove(): Promise<void> {
        return new Promise((resolve): void => resolve());
    }

    public async getAccessToken(token: string): Promise<AccessToken|null> {
        return new Promise((): void => {});
    }

    public async getAccessTokens(): Promise<AccessToken[]> {
        return new Promise((): void => {});
    }

    public async getActiveAccessTokens(): Promise<AccessToken[]> {
        return new Promise((): void => {});
    }
}

type Interface<T = {}> = Function & { prototype: T };

function Stored<T, TBase extends Interface>(
    Base: TBase,
    defaultAttributes: ModelAttributes,
): TBase & typeof Model {
    type Instance = {
        new(...args: any[]): Class;
    } & Class

    class Class extends Model {
        protected static includes = [];

        public static async first(filters: any): Promise<Class|null> {
            return await this.findOne({
                where: filters,
                include: this.includes,
            });
        }

        public static async filter(filters: any): Promise<Class[]> {
            return await this.findAll({
                where: filters,
                include: this.includes,
            });
        }

        public static init(
            attributes: ModelAttributes,
            options: InitOptions,
        ): void {
            super.init(
                {...defaultAttributes, ...attributes},
                options,
            );
        }
    }

    Object.getOwnPropertyNames(Base.prototype).forEach((name): void => {
        if (Class.prototype.hasOwnProperty(name))
            return;
        Object.defineProperty(
            Class.prototype,
            name,
            Object.getOwnPropertyDescriptor(
                Base.prototype,
                name,
            ) as PropertyDescriptor,
        );
    });
    Object.getOwnPropertyNames(Base).forEach((name): void => {
        if (Class.hasOwnProperty(name))
            return;
        Object.defineProperty(
            Class,
            name,
            Object.getOwnPropertyDescriptor(
                Base,
                name,
            ) as PropertyDescriptor,
        );
    });

    Object.defineProperty(Class, 'name', {
        value: 'Sequelized' + (Object.getOwnPropertyDescriptor(
            Base,
            'name',
        ) as PropertyDescriptor).value,
    });

    return Class as unknown as (TBase & typeof Model);
}

export class SequelizeUser extends
    (Stored<User, typeof User>(
        User,
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            username: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            },
            password: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
    ) as (typeof Model & typeof ImplementedUser)) {

    public id!: number;
    public username!: string;
    public password!: string;
    public isActive!: boolean;

    /**
     * Takes a string token and returns the AccessToken instance with that
     * token that belongs to the User instance (has its user foreign key set to
     * the User instance).
     */
    public async getAccessToken(token: string): Promise<AccessToken|null> {
        return await AccessToken.first({token, userId: this.id});
    }

    /**
     * Returns all AccessToken instances that belong to this User (have their
     * user foreign key set to the User instance).
     */
    public async getAccessTokens(): Promise<AccessToken[]> {
        return await AccessToken.filter({userId: this.id});
    }

    /**
     * Returns all AccessToken instances that belong to this User (have their
     * user foreign key set to the User instance) and are not expired yet.
     */
    public async getActiveAccessTokens(): Promise<AccessToken[]> {
        return await AccessToken.filter({userId: this.id, active: true});
    }

    /**
     * Generates associations for SequelizeAccesToken
     */
    public static associate(models: AssociationParameters): void {
    }
}
Object.defineProperty(SequelizeUser, 'name', {value: 'User'});

export class SequelizeAccessToken extends
    (Stored<AccessToken, typeof AccessToken>(
        AccessToken,
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            token: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            },
            refreshToken: {
                type: new DataTypes.STRING(128),
                allowNull: false,
            },
            expires: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            consumed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
    ) as (typeof Model & typeof ImplementedAccessToken)) {
    protected static includes = [
        {model: SequelizeUser, foreignKey: 'userId', as: 'user'},
    ];
    public id!: number;
    public token!: string;
    public refreshToken!: string;
    public expires!: Date;
    public user!: SequelizeUser;
    public consumed!: boolean;

    public constructor(...args: any[]) {
        if (!args[0].token)
            args[0].token = crypto
                .randomBytes(22)
                .toString('base64')
                .replace(/=*$/g, '');
        if (!args[0].refreshToken)
            args[0].refreshToken = crypto
                .randomBytes(22)
                .toString('base64')
                .replace(/=*$/g, '');
        if (!args[0].userId && args[0].user)
            args[0].userId = args[0].user.id;
        super(...args);
    }

    /**
     * Generates associations for SequelizeAccesToken
     */
    public static associate(models: AssociationParameters): void {
        models.AccessToken!.belongsTo(models.User!, {
            as: 'user',
            foreignKey: 'userId',
            targetKey: 'id',
        });
    }

    /*
     * Issues an access token inheriting from core class and adding the user
     * instance to the returned value to stay compatible with core API
     */
    public static async issue(user: User): Promise<AccessToken> {
        const accessToken = await super.issue(user);
        return (await this.first({token: accessToken.token}))!;
    }
}
Object.defineProperty(SequelizeAccessToken, 'name', {value: 'AccessToken'});

export interface AssociationParameters {
    User?: typeof SequelizeUser;
    AccessToken?: typeof SequelizeAccessToken;
}
