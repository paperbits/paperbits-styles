import { ThemeContract } from "../contracts";

export interface MigrationService {
    migrateTheme?(theme: ThemeContract): Promise<void>;
}
