export interface ErrorMessage {
    code: number;
    message: string;
    /** Discord's own words: `a complete list of errors is not feasible and would be almost instantly out of date` */
    errors?: Record<string, unknown>;
}
