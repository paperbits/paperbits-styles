import * as Utils from "@paperbits/common/utils";
import { IObjectStorage } from "@paperbits/common/persistence";
import { IEventManager } from "@paperbits/common/events";
import { ThemeContract, ColorContract } from "./contracts";


const stylesPath = "styles";

const config: ThemeContract = {
    fonts: {
        default: {
            key: "fonts/default",
            displayName: "Advent Pro",
            kind: "webfonts#webfont",
            family: "Advent Pro",
            category: "sans-serif",
            variants: [
                {
                    weight: 100,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mCoQfxVT4Dvddr_yOwjVmtLQ.ttf"
                },
                {
                    weight: 200,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjfWMDbY.ttf"
                },
                {
                    weight: 300,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjZGPDbY.ttf"
                },
                {
                    weight: 400,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mAoQfxVT4Dvddr_yOwtT0.ttf"
                },
                {
                    weight: 500,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjcmODbY.ttf"
                },
                {
                    weight: 600,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjeWJDbY.ttf"
                },
                {
                    weight: 700,
                    style: "normal",
                    file: "http://fonts.gstatic.com/s/adventpro/v7/V8mDoQfxVT4Dvddr_yOwjYGIDbY.ttf"
                }
            ],
            version: "v7",
            lastModified: "2017-10-10"
        },
        quicksand: {
            family: "Quicksand",
            displayName: "Quicksand",
            key: "fonts/quicksand",
            variants: [{
                file: "http://fonts.gstatic.com/s/quicksand/v8/6xKodSZaM9iE8KbpRA_pgHYoSA.ttf",
                style: "normal",
                weight: "300"
            }, {
                file: "http://fonts.gstatic.com/s/quicksand/v8/6xKtdSZaM9iE8KbpRA_RLA.ttf",
                style: "regular",
                weight: 400
            }, {
                file: "http://fonts.gstatic.com/s/quicksand/v8/6xKodSZaM9iE8KbpRA_p2HcoSA.ttf",
                style: "normal",
                weight: "500"
            }, {
                file: "http://fonts.gstatic.com/s/quicksand/v8/6xKodSZaM9iE8KbpRA_pkHEoSA.ttf",
                style: "normal",
                weight: "700"
            }]
        },
        jollyGood: {
            family: "JollyGoodSans-Basic",
            displayName: "Jolly Good",
            key: "fonts/jollyGood",
            variants: [{
                file: "http://cdn.paperbits.io/fonts/JollyGoodSans-Basic.woff2",
                style: "normal",
                weight: "400"
            }]
        }
    },
    colors: {
        default: {
            key: "colors/default",
            displayName: "Default text",
            value: "#000"
        },
        defaultBg: {
            key: "colors/defaultBg",
            displayName: "Default Bg",
            value: "#fff"
        },
        primaryBg: {
            key: "colors/primaryBg",
            displayName: "Primary Bg",
            value: "#4AB3F4"
        },
        primaryText: {
            key: "colors/primaryText",
            displayName: "Primary text",
            value: "#fff"
        },
        dark: {
            key: "colors/dark",
            displayName: "Dark Bg",
            value: "#2a2a59"
        },
    },
    shadows: {
        shadow1: {
            key: "shadows/shadow1",
            displayName: "Light shadow",
            offsetX: 1,
            offsetY: 1,
            blur: 3,
            spread: 0,
            color: "rgba(0, 0, 0, 0.5)"
        },
        shadow2: {
            key: "shadows/shadow2",
            displayName: "Medium shadow",
            offsetX: 2,
            offsetY: 2,
            blur: 10,
            spread: 0,
            color: "rgba(0, 0, 0, 0.5)"
        },
        shadow3: {
            key: "shadows/shadow3",
            displayName: "Inset shadow",
            offsetX: 1,
            offsetY: 1,
            blur: 2,
            spread: 0,
            color: "rgba(0, 0, 0, 0.1)",
            inset: true
        },
    },
    animations: {
        shake: {
            key: "animations/shake",
            displayName: "Shake",
            name: "shake",
            duration: 1000,
            iterationCount: "infinite",
            timingFunction: "linear"
        }
    },
    globals: {
        body: {
            displayName: "Text",
            typography: {
                fontKey: "fonts/quicksand",
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 18,
            }
        },
        p: {
            displayName: "Paragraph",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 18,
            }
        },
        h1: {
            displayName: "Heading Level 1",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 45,
            }
        },
        h2: {
            displayName: "Heading Level 2",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 30,
            }
        },
        h3: {
            displayName: "Heading Level 3",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 25,
            }
        },
        h4: {
            displayName: "Heading Level 4",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 20,
            }
        },
        h5: {
            displayName: "Heading Level 5",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 18,
            }
        },
        h6: {
            displayName: "Heading Level 6",
            typography: {
                fontWeight: "normal",
                fontStyle: "normal",
                fontSize: 16,
            }
        },
        blockquote: {
            displayName: "Quote",
            typography: {
                fontWeight: "normal",
                fontStyle: "italic",
                fontSize: 30,
                textAlign: "center"
            }
        }
    },
    components: { // should we take media-queries into account?
        button: {
            default: {
                key: "components/button/default",
                displayName: "Normal button",
                category: "appearance",
                padding: {
                    top: 11,
                    left: 30, // should be CSS variable? --left-padding. "large", "small"
                    right: 30,
                    bottom: 11
                },
                margin: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 10
                },
                border: {
                    top: {
                        width: 0,
                        style: "solid",
                        color: "orange"
                    },
                    left: {
                        width: 0,
                        style: "solid",
                        color: "orange"
                    },
                    right: {
                        width: 0,
                        style: "solid",
                        color: "orange"
                    },
                    bottom: {
                        width: 0,
                        style: "solid",
                        color: "orange"
                    }
                },
                borderRadius: {
                    topLeftRadius: 5,
                    topRightRadius: 5,
                    bottomLeftRadius: 5,
                    bottomRightRadius: 5
                },
                background: {
                    colorKey: "colors/defaultBg"
                },
                shadow: {
                    shadowKey: "shadows/shadow1"
                },
                // animation: "animations/shake",
                typography: {
                    // fontKey: "fonts/default",
                    fontWeight: "normal",
                    fontStyle: "normal",
                    colorKey: "colors/default"
                }
            },
            primary: {
                key: "components/button/primary",
                displayName: "Primary button",
                category: "appearance",
                background: {
                    colorKey: "colors/primaryBg"
                },
                typography: {
                    colorKey: "colors/primaryText"
                }
            },
            large: {
                key: "components/button/large",
                displayName: "Large button",
                category: "size",
                padding: {
                    top: 20,
                    left: 50,
                    right: 50,
                    bottom: 20
                },
            }
        },
        formControl: {
            default: {
                key: "components/formControl/default",
                displayName: "Text box",
                padding: {
                    top: 10,
                    left: 10, // should be CSS variable? --left-padding. "large", "small"
                    right: 10,
                    bottom: 10
                },
                margin: {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                },
                border: {
                    top: {
                        width: 1,
                        style: "solid",
                        color: "#ced4da"
                    },
                    left: {
                        width: 1,
                        style: "solid",
                        color: "#ced4da"
                    },
                    right: {
                        width: 1,
                        style: "solid",
                        color: "#ced4da"
                    },
                    bottom: {
                        width: 1,
                        style: "solid",
                        color: "#ced4da"
                    }
                },
                borderRadius: {
                    topLeftRadius: 5,
                    topRightRadius: 5,
                    bottomLeftRadius: 5,
                    bottomRightRadius: 5
                },
                // background: {
                //     colorKey: "colors/primaryBg"
                // },
                shadow: {
                    shadowKey: "shadows/shadow3"
                },
                // animation: "animations/shake",
                typography: {
                    // fontKey: "fonts/default",
                    fontWeight: "normal",
                    fontStyle: "normal"
                }
            }
        },
        navbar: {
            default: {
                key: "components/navbar/default",
                displayName: "Navigation bar",
                typography: {
                    // fontKey: "fonts/default",
                    fontWeight: "normal",
                    fontStyle: "normal",
                    colorKey: "colors/primaryText"
                },
                components: {
                    navLink: {
                        key: "components/navbar/default/components/navLink",
                        displayName: "Navigation link",
                        typography: {
                            // fontKey: "fonts/default",
                            fontWeight: "normal",
                            fontStyle: "normal",
                            colorKey: "colors/default"
                        }
                    }
                }
            }
        }
    }
};

export class StyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly eventManager: IEventManager
    ) { }

    public async getStyles(): Promise<ThemeContract> {
        // console.log(JSON.stringify(config));
        // return config;
        return await this.objectStorage.getObject<ThemeContract>(stylesPath);
    }

    public getClassNameByStyleKey(key: string): string {
        // TODO: Consider a case: components/navbar/default/components/navlink
        let className = key.replaceAll("components/", "").replaceAll("instances/", "").replaceAll("/", "-");

        className = className.replaceAll("-default", "");
        className = Utils.camelCaseToKebabCase(className);

        return className;
    }

    public async getColorByKey(colorKey: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        return Utils.getObjectAt<ColorContract>(colorKey, styles);
    }

    public async addColorVariation(variationName: string): Promise<string> {
        const styles = await this.getStyles();
        const newColor = Utils.clone(styles["colors"]["default"]);
        newColor.key = `colors/${variationName}`;

        styles["colors"][variationName] = newColor;

        this.updateStyles(styles);

        return `colors/${variationName}`;
    }

    public async addComponentVariation(componentName: string, variationName: string): Promise<string> {
        const styles = await this.getStyles();

        const newVariation = Utils.clone(styles["components"][componentName]["default"]);
        newVariation.key = `components/${componentName}/${variationName}`;

        styles["components"][componentName][variationName] = newVariation;

        this.updateStyles(styles);

        return `components/${componentName}/${variationName}`;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        this.objectStorage.updateObject(stylesPath, updatedStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }

    public async getVariations<TVariation>(categoryName: string): Promise<TVariation[]> {
        const styles = await this.getStyles();

        const variations = Object.keys(styles[categoryName]).map(variationName => {
            const variationContract = styles[categoryName][variationName];
            return variationContract;
        });

        return variations;
    }

    public async getComponentVariations(componentName: string): Promise<any[]> {
        const styles = await this.getStyles();
        const componentStyles = styles.components[componentName];

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            return variationContract;
        });

        return variations;
    }

    public async setInstanceStyle(instanceKey: string, instanceStyles: Object): Promise<void> {
        const styles = await this.getStyles();
        Utils.mergeDeepAt(instanceKey, styles, instanceStyles);
        this.eventManager.dispatchEvent("onStyleChange");
    }
}