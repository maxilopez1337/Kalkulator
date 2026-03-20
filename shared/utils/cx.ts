/**
 * Lightweight className utility — joins truthy class strings.
 * Usage: cx('base', condition && 'active', otherCondition && 'extra')
 */
export const cx = (...classes: (string | false | null | undefined)[]): string =>
    classes.filter(Boolean).join(' ');
