export interface BorderStyleContract {
    width?: string | number;
    style?: string;
    color?: string;
    colorKey?: string;
}

export interface BorderContract {
    top?: BorderStyleContract;
    left?: BorderStyleContract;
    right?: BorderStyleContract;
    bottom?: BorderStyleContract;
}

export interface BorderRadiusContract {
    topLeftRadius?: string | number;
    topRightRadius?: string | number;
    bottomLeftRadius?: string | number;
    bottomRightRadius?: string | number;
}