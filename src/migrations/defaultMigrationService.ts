import { ThemeContract } from "../contracts";
import { ThemeMigration1 } from "./themeMigration1";
import { MigrationService } from "./migrationService";
import { ThemeMigration } from "./themeMigration";


export class DefaultMigrationService implements MigrationService {
    private migrations: ThemeMigration[] = [
        new ThemeMigration1()
    ];

    public async migrateTheme(theme: ThemeContract): Promise<void> {
        const requiredMigrations = !!theme.schemaVersion
            ? this.migrations.filter(x => x.schemaVersion > theme.schemaVersion)
            : this.migrations; // no migrations applied yet

        for (const requiredMigration of requiredMigrations) {
            await requiredMigration.migrate(theme);
        }
    }
}
