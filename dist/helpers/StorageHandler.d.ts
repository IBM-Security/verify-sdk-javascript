import { IToken } from '.';
declare function StorageHandler(storageType: Storage): {
    setStorage: (obj: IToken) => void;
    getStorage: (opt: string) => string | null | Error;
    clearStorage: () => void;
};
export default StorageHandler;
