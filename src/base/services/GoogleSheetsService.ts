// GoogleSheetsService.ts
declare global {
    interface Window {
        google: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: TokenClientConfig) => TokenClient;
                };
            };
        };
    }
}

interface TokenResponse {
    access_token?: string;
    error?: string;
    error_description?: string;
}

interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
}

interface TokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
}

interface RegistrationData {
    name: string;
    companyName: string;
    contactNumber: string;
    emailAddress: string;
}

interface FileInfo {
    spreadsheetId: string;
    lastModified: Date;
    recordCount: number;
}

export class GoogleSheetsService {
    private static readonly CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
    private static readonly SPREADSHEET_ID = import.meta.env.VITE_APP_GOOGLE_SHEET_ID;
    private static readonly SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
    private static readonly API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;
    private static tokenClient: TokenClient | null = null;
    private static accessToken: string | null = null;

    public static async initializeClient(): Promise<void> {
        return new Promise((resolve, reject) => {
            const checkGoogleScript = () => {
                if (window.google && window.google.accounts) {
                    try {
                        GoogleSheetsService.tokenClient = window.google.accounts.oauth2.initTokenClient({
                            client_id: this.CLIENT_ID,
                            scope: this.SCOPE,
                            callback: (response: TokenResponse) => {
                                if (response.access_token) {
                                    this.accessToken = response.access_token;
                                    console.log('Google Identity Services initialized successfully');
                                    resolve();
                                } else {
                                    console.error('No access token received:', response.error || 'Unknown error');
                                    reject(new Error('Authentication failed'));
                                }
                            },
                        });
                    } catch (error) {
                        console.error('Error initializing Google Identity Services:', error);
                        reject(error);
                    }
                } else {
                    setTimeout(checkGoogleScript, 100);
                }
            };
            checkGoogleScript();
        });
    }

    public static async addRegistration(data: RegistrationData): Promise<void> {
        try {
            console.log('Starting registration process...', data);
            await this.ensureAuthenticated();

            // Check if sheet exists and get its structure
            const sheetInfo = await this.getSheetInfo();
            
            if (!sheetInfo.hasRegistrationsSheet) {
                console.log('Registrations sheet not found, creating...');
                await this.createRegistrationsSheet();
            }

            if (sheetInfo.isEmpty) {
                console.log('Sheet is empty, initializing headers...');
                await this.initializeHeaders();
            }

            // Add the registration data
            const newRow = [
                data.name,
                data.companyName,
                data.contactNumber,
                data.emailAddress,
                new Date().toISOString(),
            ];

            console.log('Adding new row:', newRow);

            const appendResponse = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/Registrations:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        values: [newRow],
                    }),
                }
            );

            if (!appendResponse.ok) {
                const errorText = await appendResponse.text();
                console.error('Append error response:', errorText);
                throw new Error(`HTTP error! status: ${appendResponse.status}`);
            }

            const result = await appendResponse.json();
            console.log('Registration added successfully:', result);

        } catch (error: any) {
            console.error('Detailed error adding registration:', error);
            
            if (error?.status === 403) {
                throw new Error('Permission denied. Please check your Google Sheets sharing settings and API permissions.');
            } else if (error?.status === 404) {
                throw new Error('Spreadsheet not found. Please verify the spreadsheet ID.');
            } else if (error?.status === 401) {
                throw new Error('Authentication failed. Please sign in again.');
            } else if (error?.status === 400) {
                throw new Error('Invalid request. Please check the spreadsheet structure or try again.');
            } else {
                throw new Error(`Failed to add registration: ${error?.message || 'Unknown error'}`);
            }
        }
    }

    private static async getSheetInfo(): Promise<{hasRegistrationsSheet: boolean, isEmpty: boolean}> {
        try {
            // Get spreadsheet metadata
            const metadataResponse = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!metadataResponse.ok) {
                throw new Error(`Failed to get spreadsheet metadata: ${metadataResponse.status}`);
            }

            const metadata = await metadataResponse.json();
            const sheets = metadata.sheets || [];
            const hasRegistrationsSheet = sheets.some((sheet: any) => 
                sheet.properties?.title === 'Registrations'
            );

            let isEmpty = true;
            if (hasRegistrationsSheet) {
                // Check if sheet has data
                const valuesResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/Registrations`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.accessToken}`,
                        },
                    }
                );

                if (valuesResponse.ok) {
                    const valuesResult = await valuesResponse.json();
                    const values = valuesResult.values || [];
                    isEmpty = values.length <= 6; // Less than or equal to header rows
                }
            }

            return { hasRegistrationsSheet, isEmpty };
        } catch (error) {
            console.error('Error getting sheet info:', error);
            return { hasRegistrationsSheet: false, isEmpty: true };
        }
    }

    private static async createRegistrationsSheet(): Promise<void> {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: 'Registrations',
                                },
                            },
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to create Registrations sheet: ${response.status}`);
        }
    }

    private static async initializeHeaders(): Promise<void> {
        const headerValues = [
            ['24TH IIEE EASTERN AND CENTRAL VISAYAS REGIONAL CONFERENCE'],
            ['IEC Pavilion, Cebu City'],
            ['JULY 25 - 26, 2025'],
            [],
            [],
            ['NAME', 'COMPANY NAME', 'CONTACT NUMBER', 'EMAIL ADDRESS', 'TIMESTAMP'],
        ];

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/Registrations!A1:E6?valueInputOption=RAW`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: headerValues,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to initialize headers: ${response.status}`);
        }
    }

    public static async getFileInfo(): Promise<FileInfo | null> {
        try {
            await this.ensureAuthenticated();

            const valuesResponse = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/Registrations`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!valuesResponse.ok) {
                return null;
            }

            const valuesResult = await valuesResponse.json();
            const values = valuesResult.values || [];
            const recordCount = Math.max(0, values.length - 6);

            const metadataResponse = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!metadataResponse.ok) {
                return null;
            }

            const metadata = await metadataResponse.json();

            return {
                spreadsheetId: this.SPREADSHEET_ID,
                lastModified: new Date(metadata.properties?.timeZone || Date.now()),
                recordCount,
            };
        } catch (error: any) {
            console.error('Error getting file info:', error);
            return null;
        }
    }

    private static async ensureAuthenticated(): Promise<void> {
        if (!this.tokenClient) {
            throw new Error('Token client not initialized');
        }

        if (!this.accessToken) {
            console.log('Requesting access token...');
            return new Promise((resolve, reject) => {
                const authTokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: this.CLIENT_ID,
                    scope: this.SCOPE,
                    callback: (response: TokenResponse) => {
                        if (response.access_token) {
                            this.accessToken = response.access_token;
                            console.log('User authenticated successfully');
                            resolve();
                        } else {
                            console.error('Authentication failed:', response.error || 'Unknown error');
                            reject(new Error('Authentication required. Please sign in to continue.'));
                        }
                    },
                });
                authTokenClient.requestAccessToken({ prompt: 'consent' });
            });
        }
    }

    public static async testConnection(): Promise<boolean> {
        try {
            console.log('Testing connection...');
            console.log('CLIENT_ID:', this.CLIENT_ID ? '✓ Set' : '✗ Missing');
            console.log('SPREADSHEET_ID:', this.SPREADSHEET_ID ? '✓ Set' : '✗ Missing');
            console.log('API_KEY:', this.API_KEY ? '✓ Set' : '✗ Missing');

            if (!this.CLIENT_ID || !this.SPREADSHEET_ID || !this.API_KEY) {
                console.error('Missing required environment variables');
                return false;
            }

            if (!this.tokenClient) {
                console.error('Token client not initialized');
                return false;
            }

            await this.ensureAuthenticated();
            console.log('Authentication successful');

            const response = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Connection test successful:', result.properties?.title);
            return true;
        } catch (error: any) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}