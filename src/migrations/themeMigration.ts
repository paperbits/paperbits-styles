import { ThemeContract } from "../contracts";

export interface ThemeMigration {
    schemaVersion: number;
    migrate(theme: ThemeContract): Promise<void>;
}