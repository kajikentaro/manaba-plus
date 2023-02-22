export default class Option {
    constructor(
        public key: string,
        public hint: string,
        public description: string,
        public type: string,
        public defaultValue: string,
    ) {}
}