declare module "nanoid-dictionary" {
    export const alphabets: {
        english: {
            lowercase: string,
            uppercase: string,
        };
    };

    export const numbers: string;
    export const filename: string;
}
