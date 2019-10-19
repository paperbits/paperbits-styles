export interface StyleItemContract {
    /**
     * Unique identifier.
     */
    key: string;

    /**
     * Style display name.
     */
    displayName: string;

    /**
     * Style category, e.g. "appearance".
     */
    category?: string;
}