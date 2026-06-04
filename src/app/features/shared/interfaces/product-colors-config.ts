export interface ProductColor {
    swatchImage: string,
    thumbImage: string,
    roomImage: string,
    name: string,
    colorCode: string
}

export interface ProductColorsConfig extends Array<ProductColor> {
}
