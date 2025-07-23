import * as XLSX from 'xlsx';

interface RegistrationData {
    name: string;
    companyName: string;
    contactNumber: string;
    emailAddress: string;
}

interface ExcelFileData {
    filename: string;
    data: ArrayBuffer;
    lastModified: Date;
}

export class ExcelService {
    private static readonly DB_NAME = 'ConferenceRegistrationsDB';
    private static readonly DB_VERSION = 1;
    private static readonly STORE_NAME = 'excel_files';
    private static readonly FILENAME = 'ieee_conference_registrations.xlsx';

    // Initialize IndexedDB
    private static async initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'filename' });
                }
            };
        });
    }

    // Save Excel file to IndexedDB
    private static async saveExcelFile(workbook: XLSX.WorkBook): Promise<void> {
        try {
            const db = await this.initDB();
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            const fileData: ExcelFileData = {
                filename: this.FILENAME,
                data: excelBuffer,
                lastModified: new Date()
            };

            const transaction = db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.put(fileData);
                request.onsuccess = () => {
                    console.log(`Excel file saved to IndexedDB: ${this.FILENAME}`);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving Excel file:', error);
            throw new Error('Failed to save registration data');
        }
    }

    // Load Excel file from IndexedDB
    private static async loadExcelFile(): Promise<XLSX.WorkBook> {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.get(this.FILENAME);
                request.onsuccess = () => {
                    if (request.result) {
                        const arrayBuffer = request.result.data;
                        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        resolve(workbook);
                    } else {
                        resolve(this.createNewWorkbook()); // Create new workbook if none exists
                    }
                };
                request.onerror = () => reject(new Error(`Failed to load Excel file: ${request.error}`));
            });
        } catch (error) {
            console.error('Error loading Excel file:', error);
            throw new Error('Failed to load Excel file from IndexedDB');
        }
    }

    private static createNewWorkbook(): XLSX.WorkBook {
        const wb = XLSX.utils.book_new();

        // Create the worksheet data
        const worksheetData = [
            // Row 0: Main title (merged across A1:E1)
            ['24TH IEEE EASTERN AND CENTRAL VISAYAS REGIONAL CONFERENCE', '', '', '', ''],
            // Row 1: Venue (merged across A2:E2)  
            ['IEC Pavillion, Cebu City', '', '', '', ''],
            // Row 2: Date (merged across A3:E3)
            ['JULY 25 - 26, 2025', '', '', '', ''],
            // Row 3: Empty spacing row
            ['', '', '', '', ''],
            // Row 4: Empty spacing row
            ['', '', '', '', ''],
            // Row 5: Column headers
            ['NAME', 'COMPANY NAME', 'CONTACT NUMBER', 'EMAIL ADDRESS', '']
        ];

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        ws['!cols'] = [
            { width: 25 }, // NAME (Column A)
            { width: 30 }, // COMPANY NAME (Column B)
            { width: 20 }, // CONTACT NUMBER (Column C)
            { width: 35 }, // EMAIL ADDRESS (Column D)
            { width: 10 }  // Extra column (Column E)
        ];

        // Define merge ranges for the header
        ws['!merges'] = [
            // Main title: A1:E1
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
            // Venue: A2:E2
            { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
            // Date: A3:E3
            { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }
        ];

        // Style the main title (row 0)
        const titleCell = ws['A1'];
        if (titleCell) {
            titleCell.s = {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: { bold: true, size: 14, color: { rgb: '0000FF' } }, // Blue color
                fill: { fgColor: { rgb: 'E8F5E8' } } // Light green background
            };
        }

        // Style the venue (row 1)
        const venueCell = ws['A2'];
        if (venueCell) {
            venueCell.s = {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: { bold: true, size: 12, color: { rgb: '0000FF' } }, // Blue color
                fill: { fgColor: { rgb: 'E8F5E8' } } // Light green background
            };
        }

        // Style the date (row 2)
        const dateCell = ws['A3'];
        if (dateCell) {
            dateCell.s = {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: { bold: true, size: 12, color: { rgb: 'FF0000' } }, // Red color
                fill: { fgColor: { rgb: 'E8F5E8' } } // Light green background
            };
        }

        // Style the column headers (row 5)
        const headerColumns = ['A6', 'B6', 'C6', 'D6'];
        headerColumns.forEach(cellAddress => {
            const cell = ws[cellAddress];
            if (cell) {
                cell.s = {
                    alignment: { horizontal: 'center', vertical: 'center' },
                    font: { bold: true, size: 11, color: { rgb: '0000FF' } }, // Blue color
                    fill: { fgColor: { rgb: 'FFFFFF' } }, // White background
                    border: {
                        top: { style: 'thin', color: { rgb: '000000' } },
                        bottom: { style: 'thin', color: { rgb: '000000' } },
                        left: { style: 'thin', color: { rgb: '000000' } },
                        right: { style: 'thin', color: { rgb: '000000' } }
                    }
                };
            }
        });

        // Set the worksheet range
        ws['!ref'] = 'A1:E6';

        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
        return wb;
    }

    public static async addRegistration(data: RegistrationData): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Simulate processing time
            setTimeout(async () => {
                try {
                    // Load existing workbook or create new one
                    let workbook = await this.loadExcelFile();
                    if (!workbook || !workbook.Sheets['Registrations']) {
                        workbook = this.createNewWorkbook();
                    }

                    const worksheet = workbook.Sheets['Registrations'];
                    if (!worksheet) {
                        throw new Error('Worksheet "Registrations" not found in workbook');
                    }

                    // Find the next available row (starting from row 6, which is index 5)
                    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:E6');
                    let nextRow = Math.max(6, range.e.r + 1); // Start from row 6 (after headers)

                    // Check if there's already data in this row and find the next empty row
                    while (worksheet[XLSX.utils.encode_cell({ r: nextRow, c: 0 })]) {
                        nextRow++;
                    }

                    // Add new registration data
                    const newData = [
                        data.name,
                        data.companyName,
                        data.contactNumber,
                        data.emailAddress
                    ];

                    newData.forEach((value, colIndex) => {
                        const cellAddress = XLSX.utils.encode_cell({ r: nextRow, c: colIndex });
                        worksheet[cellAddress] = { 
                            t: 's', 
                            v: value,
                            s: {
                                border: {
                                    top: { style: 'thin', color: { rgb: '000000' } },
                                    bottom: { style: 'thin', color: { rgb: '000000' } },
                                    left: { style: 'thin', color: { rgb: '000000' } },
                                    right: { style: 'thin', color: { rgb: '000000' } }
                                }
                            }
                        };
                    });

                    // Update the worksheet range
                    const newRange = XLSX.utils.encode_range({
                        s: { c: 0, r: 0 },
                        e: { c: 4, r: nextRow }
                    });
                    worksheet['!ref'] = newRange;

                    // Save the updated workbook to IndexedDB
                    await this.saveExcelFile(workbook);

                    console.log('Registration added successfully to IndexedDB');
                    resolve();
                } catch (error) {
                    console.error('Error adding registration:', error);
                    reject(error);
                }
            }, 2000);
        });
    }

    public static async getRegistrations(): Promise<RegistrationData[]> {
        try {
            const workbook = await this.loadExcelFile();
            if (!workbook) return [];

            const worksheet = workbook.Sheets['Registrations'];

            // Get data starting from row 6 (index 5) which is after the headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                range: 6, // Start from row 6 (0-indexed, so row 6 is index 5)
                header: ['name', 'companyName', 'contactNumber', 'emailAddress']
            }) as RegistrationData[];

            return jsonData.filter((item: RegistrationData) =>
                item.name || item.companyName || item.contactNumber || item.emailAddress
            );
        } catch (error) {
            console.error('Error getting registrations:', error);
            return [];
        }
    }

    // Method to download the current Excel file
    public static async downloadExcelFile(): Promise<void> {
        try {
            const workbook = await this.loadExcelFile();
            if (!workbook) {
                throw new Error('No registration data found');
            }

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const dataBlob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.FILENAME;
            link.click();
            URL.revokeObjectURL(url);

            console.log('Excel file downloaded successfully');
        } catch (error) {
            console.error('Error downloading Excel file:', error);
            throw error;
        }
    }

    // Method to get file info
    public static async getFileInfo(): Promise<{ filename: string; lastModified: Date; recordCount: number } | null> {
        try {
            const db = await this.initDB();
            const transaction = db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);

            return new Promise((resolve, reject) => {
                const request = store.get(this.FILENAME);
                request.onsuccess = async () => {
                    if (request.result) {
                        const registrations = await this.getRegistrations();
                        resolve({
                            filename: request.result.filename,
                            lastModified: request.result.lastModified,
                            recordCount: registrations.length
                        });
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    }
}