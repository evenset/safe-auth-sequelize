import crypto from 'crypto';
import {Sequelize, Model, DataTypes} from 'sequelize';
import {User, AccessToken} from 'safe-auth';

type Interface<T = {}> = Function & { prototype: T };

interface Constructor<T = {}> {
    new(...args: any[]): T;
    prototype: T;
}

interface StoredModelConstructor<T = {
    remove(): Promise<void>;
    save(): Promise<void>;
    id: number|undefined;
    createdAt: Date;
    updatedAt: Date;
}> {
    new(...args: any[]): T;
}

export interface ReturnType {
    SequelizeUser: typeof User & StoredModelConstructor & typeof Model;
    SequelizeAccessToken: typeof AccessToken & StoredModelConstructor &
        typeof Model;
}

export default function(sequelize: Sequelize): ReturnType {
    function Stored<T, TBase extends Interface>(
        Base: TBase,
        constructor?: (...args: any[]) => void
    ): TBase & typeof Model {
        type Instance = {
            new(...args: any[]): Class;
            idCounter: number;
        } & Class

        class Class extends Model {
            public constructor(...args: any[]) {
                if (constructor)
                    constructor(...args);
                super(...args);
            }

            public static async first(args: any): Promise<Class|null> {
                return await this.findOne({where: args});
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
            value: (Object.getOwnPropertyDescriptor(
                Base,
                'name',
            ) as PropertyDescriptor).value,
        });

        return Class as unknown as (TBase & typeof Model);
    }

    const SequelizeUser = Stored<User, typeof User>(User);

    SequelizeUser.init({
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
    }, {sequelize});

    // class SequelizeAccessToken extends
    //     (Stored<AccessToken, typeof AccessToken>(AccessToken) as typeof Model) {
    //     public id!: number;
    //     public token!: string;
    //     public refreshToken!: string;
    //     public readonly expires!: Date;
    //     public user!: User;
    //     public consumed!: boolean;
    //     public readonly createdAt!: Date;
    //     public readonly updatedAt!: Date;
    //
    //     public constructor(...args: any[]) {
    //         if (!args[0].token)
    //             args[0].token = crypto
    //                 .randomBytes(22)
    //                 .toString('base64')
    //                 .replace(/=*$/g, '');
    //         if (!args[0].refreshToken)
    //             args[0].refreshToken = crypto
    //                 .randomBytes(22)
    //                 .toString('base64')
    //                 .replace(/=*$/g, '');
    //         if (!args[0].userId && args[0].user)
    //             args[0].userId = args[0].user.id;
    //         super(...args);
    //     }
    // }
    const SequelizeAccessToken = Stored<AccessToken, typeof AccessToken>(
        AccessToken,
        (...args: any[]): void => {
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
        },
    );
    SequelizeAccessToken.init({
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
            allowNull: false,
        },
        consumed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    }, {sequelize});
    SequelizeAccessToken.belongsTo(SequelizeUser, {
        as: 'user',
        foreignKey: 'userId',
        targetKey: 'id',
    });

    return {SequelizeUser, SequelizeAccessToken};
}
