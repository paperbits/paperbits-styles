import { ThemeContract } from "../src/contracts";
import { ThemeMigration1 } from "../src/migrations/themeMigration1";

describe("Style migrations", async () => {
    it("Form control migration.", async () => {
        const migration = new ThemeMigration1();
        const theme: ThemeContract = {
            components: {
                "formControl": {
                    "default": {
                        "allowedStates": [
                            "hover",
                            "focus",
                            "active",
                            "disabled",
                            "valid",
                            "invalid"
                        ],
                        "displayName": "Form control",
                        "key": "components/formControl/default",
                        "margin": {
                            "bottom": 0,
                            "left": 0,
                            "right": 0,
                            "top": 0
                        },
                        "padding": {
                            "bottom": 10,
                            "left": 10,
                            "right": 10,
                            "top": 10
                        },
                        "shadow": {
                            "shadowKey": "shadows/shadow3"
                        },
                        "typography": {
                            "fontStyle": "normal",
                            "fontWeight": "normal"
                        }
                    }, 
                    "anotherVariant": {
                        "allowedStates": [
                            "hover",
                            "focus",
                            "active",
                            "disabled",
                            "valid",
                            "invalid"
                        ],
                        "category": "appearance",
                        "displayName": "Form control",
                        "key": "components/formControl/default",
                        "margin": {
                            "bottom": 0,
                            "left": 0,
                            "right": 0,
                            "top": 0
                        },
                        "padding": {
                            "bottom": 10,
                            "left": 10,
                            "right": 10,
                            "top": 10
                        },
                        "shadow": {
                            "shadowKey": "shadows/shadow3"
                        },
                        "typography": {
                            "fontStyle": "normal",
                            "fontWeight": "normal"
                        }
                    }
                }
            }
        };

        await migration.migrate(theme);

        console.log(JSON.stringify(theme, null, 4));

        debugger;
    });
});
