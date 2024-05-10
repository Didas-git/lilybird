import type { Locale } from "#enums";

export declare namespace Localizations {
    export type LocalizeType<T> = T & Base;

    export interface Base {
        name_localizations?: Record<Locale, string> | null;
        description_localizations?: Record<Locale, string> | null;
    }

    export interface Localized {
        name_localized: string;
        description_localized: string;
    }
}
