import {Sequelize} from 'sequelize';
import {Model, DataTypes} from 'sequelize';
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
    ): TBase & StoredModelConstructor & typeof Model {
        type Instance = {
            new(...args: any[]): Class;
            items: {[key: number]: Class};
            idCounter: number;
        } & Class

        class Class extends Model {
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
        return Class as unknown as (
            TBase &
            {items: {[key: number]: T}} &
            StoredModelConstructor &
            typeof Model
        );
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

    const SequelizeAccessToken = Stored<AccessToken, typeof AccessToken>(
        AccessToken,
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

    return {SequelizeUser, SequelizeAccessToken};
}
