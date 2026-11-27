import type { TFunction } from 'i18next';

type SimpleTranslate = (key: string, options?: Record<string, unknown>) => string;

/** react-i18next `t` in product code; plain stubs in unit tests. */
export type MwTranslateFn = TFunction<'translation', undefined> | SimpleTranslate;