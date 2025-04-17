declare interface FormData {
    entries(): IterableIterator<[string, string | File]>;
}