import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.post('/fetchCarData', async (req, res) => {
    const { tokenId } = req.body;
    console.log('Received Token ID:', tokenId);
    const query = `
        query {
            vehicle(tokenId: ${tokenId}) {
                id
                name
                owner
                mintedAt
                dcn {
                    name
                }
                definition {
                    make
                    model
                    year
                    id
                }
                earnings {
                    totalTokens
                }
            }
        }
    `;

    try {
        const response = await axios.post(process.env.DIMO_API_URL, { query }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log('API Response:', response.data);

        if (response.headers['content-type'].includes('text/html')) {
            console.error('Received HTML instead of JSON, please check the endpoint or authentication.');
            return res.status(500).json({ error: 'Invalid response from server' });
        }

        const responseData = response.data;
        if (responseData.errors) {
            console.error('GraphQL errors:', responseData.errors);
            return res.status(500).json({ errors: responseData.errors });
        }

        if (responseData.data && responseData.data.vehicle) {
            return res.json(responseData.data.vehicle);
        } else {
            return res.status(404).json({ error: 'No data found for the given token ID.' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/fetchAdvancedCarData', async (req, res) => {
    const { definitionId } = req.body;
    console.log('Received Definition ID:', definitionId);
    const query = `
        query {
            deviceDefinition(by: { id: "${definitionId}" }) {
                model
                year
                deviceType
                imageURI
                attributes {
                    name
                    value
                }
            }
        }
    `;

    try {
        const response = await axios.post(process.env.DIMO_API_URL, { query }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log('API Response:', response.data);

        if (response.headers['content-type'].includes('text/html')) {
            console.error('Received HTML instead of JSON, please check the endpoint or authentication.');
            return res.status(500).json({ error: 'Invalid response from server' });
        }

        const responseData = response.data;
        if (responseData.errors) {
            console.error('GraphQL errors:', responseData.errors);
            return res.status(500).json({ errors: responseData.errors });
        }

        if (responseData.data && responseData.data.deviceDefinition) {
            return res.json(responseData.data.deviceDefinition);
        } else {
            return res.status(404).json({ error: 'No data found for the given definition ID.' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.post('/fetchRewardsHistory', async (req, res) => {
    const { tokenId } = req.body;
    console.log('Received Token ID:', tokenId);
    const query = `
        query {
            vehicle(tokenId: ${tokenId}) {
                earnings {
                    totalTokens
                    history(first: 1) {
                        totalCount
                        edges {
                            node {
                                connectionStreak
                                week
                                streakTokens
                                aftermarketDeviceTokens
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await axios.post(process.env.DIMO_API_URL, { query }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log('API Response:', response.data);

        if (response.headers['content-type'].includes('text/html')) {
            console.error('Received HTML instead of JSON, please check the endpoint or authentication.');
            return res.status(500).json({ error: 'Invalid response from server' });
        }

        const responseData = response.data;
        if (responseData.errors) {
            console.error('GraphQL errors:', responseData.errors);
            return res.status(500).json({ errors: responseData.errors });
        }

        if (responseData.data && responseData.data.vehicle) {
            return res.json(responseData.data.vehicle.earnings.history);
        } else {
            return res.status(404).json({ error: 'No rewards history found for the given token ID.' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/token/:tokenId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/health', (req, res) => {
    res.status(200).json({ status:'UP'});
});

