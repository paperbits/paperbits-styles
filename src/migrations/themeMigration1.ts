import { VariationBagContract, VariationContract } from "@paperbits/common/styles";
import { ThemeContract } from "../contracts";
import { ThemeMigration } from "./themeMigration";


export class ThemeMigration1 implements ThemeMigration {
    public schemaVersion = 1;

    public async migrate(theme: ThemeContract): Promise<void> {
        const formControlVariationBag = theme.components["formControl"];

        if (!formControlVariationBag) {
            return;
        }

        delete theme.components["formControl"];

        const formGroupVariationBag: VariationBagContract = theme.components["formGroup"] = {};
        const formControlVariationKeys = Object.keys(formControlVariationBag);

        formControlVariationKeys.forEach(key => {
            // nesting formControl into formGroup
            const formControlVariation = formControlVariationBag[key];
            formControlVariation.key = `components/formGroup/${key}/components/formControl/default`;

            const formControlMargin = formControlVariation["margin"];
            delete formControlVariation["margin"];

            const formLabelVariation: VariationContract = {
                key: `components/formGroup/${key}/components/formLabel/default`,
                displayName: "Label"
            };

            const invalidFeedbackVariation: VariationContract = {
                key: `components/formGroup/${key}/components/invalidFeedback/default`,
                displayName: "Invalid feedback"
            };

            formGroupVariationBag[key] = {
                key: `components/formGroup/${key}`,
                category: "appearance",
                displayName: "Normal form group",
                components: {
                    formControl: { default: formControlVariation },
                    formLabel: { default: formLabelVariation },
                    invalidFeedback: { default: invalidFeedbackVariation }
                },
                margin: formControlMargin
            };
        });

        theme.schemaVersion = this.schemaVersion;
    }
}
