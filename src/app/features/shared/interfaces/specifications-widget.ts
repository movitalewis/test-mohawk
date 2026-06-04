export interface Specification {
    name: string,
    value: string
    url?:string
}
export interface SpecificationsWidget extends Array<Specification> {
}
