declare module 'pdfmake/build/pdfmake' {
    interface PdfMakeDocument {
        createPdf(docDefinition: Record<string, unknown>): {
            getBlob(): Promise<Blob>;
            download(filename?: string): void;
            open(): void;
            print(): void;
        };
    }
    const pdfMake: PdfMakeDocument;
    export default pdfMake;
}