/**
 * Centralized Polish UI strings.
 * All user-facing text in confirm dialogs, error messages, and common button labels
 * should be referenced from here to simplify future maintenance.
 */
export const pl = {
    buttons: {
        cancel:      'Anuluj',
        save:        'Zapisz',
        add:         'Dodaj ręcznie',
        import:      'Importuj',
        delete:      'Usuń',
        reset:       'Przywróć domyślne',
        exportExcel: 'Eksportuj Excel',
    },
    confirms: {
        newCalculation:
            'Masz niezapisane zmiany w aktywnej sesji. Czy na pewno chcesz rozpocząć nową kalkulację? Obecne dane zostaną utracone.',
        deleteSelectedEmployees: (n: number) =>
            `Czy usunąć zaznaczonych pracowników (${n})?`,
        clearAllEmployees:
            'Czy na pewno wyczyścić całą listę pracowników?',
        resetConfig:
            'Czy na pewno przywrócić domyślne stawki podatkowe na rok 2025/2026?',
        deleteSelectedRows: (n: number) =>
            `Czy na pewno usunąć zaznaczone wiersze (${n})?`,
        clearImportList:
            'Czy na pewno usunąć wszystkich pracowników z listy importu?',
    },
    errors: {
        jsonParseFailed:
            'Błąd odczytu pliku. Upewnij się, że to poprawny plik JSON wygenerowany przez ten system.',
        noEmployees:     'Brak pracowników w ewidencji',
        invalidNip:      'Nieprawidłowy NIP',
    },
} as const;
