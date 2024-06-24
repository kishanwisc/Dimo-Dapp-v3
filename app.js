document.addEventListener('DOMContentLoaded', () => {
    const carDataDiv = document.getElementById('carData');
    const advancedCarDataDiv = document.getElementById('advancedCarData');
    const tokenInput = document.getElementById('tokenInput');
    const getCarDataButton = document.getElementById('getCarDataButton');
    const getAdvancedDataButton = document.getElementById('getAdvancedDataButton');
    const getRewardsHistoryButton = document.getElementById('getRewardsHistoryButton');
    const shareTwitterButton = document.getElementById('shareTwitterButton');

    let carData = null;

    const fetchCarData = async (tokenId) => {
        try {
            console.log('Fetching data for Token ID:', tokenId);
            const response = await fetch('/fetchCarData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                carDataDiv.innerHTML = `<p>Error: ${errorText}</p>`;
                return;
            }

            carData = await response.json();

            carDataDiv.innerHTML = `
                <h2>Car Data</h2>
                <p><strong>ID:</strong> ${carData.id}</p>
                <p><strong>Name:</strong> ${carData.name}</p>
                <p><strong>Owner:</strong> ${carData.owner}</p>
                <a href="https://polygonscan.com/address/${carData.owner}" class="icon-link" target="_blank"><i class="fa-solid fa-link"></i></a>
                <p><strong>Minted At:</strong> ${carData.mintedAt ? carData.mintedAt : 'N/A'}</p>
                <p><strong>DCN Name:</strong> ${carData.dcn ? carData.dcn.name : 'N/A'}</p>
                <p><strong>Total Tokens:</strong> ${carData.earnings ? carData.earnings.totalTokens : 'N/A'}</p>
                <p><strong>Make:</strong> ${carData.definition ? carData.definition.make : 'N/A'}</p>
                <p><strong>Model:</strong> ${carData.definition ? carData.definition.model : 'N/A'}</p>
                <p><strong>Year:</strong> ${carData.definition ? carData.definition.year : 'N/A'}</p>
                <p><strong>Definition ID:</strong> ${carData.definition ? carData.definition.id : 'N/A'}</p>
            `;

            shareTwitterButton.style.display = 'block';
            getRewardsHistoryButton.style.display = 'block';

            if (carData.definition && carData.definition.id) {
                getAdvancedDataButton.style.display = 'block';
            } else {
                getAdvancedDataButton.style.display = 'none';
            }

            advancedCarDataDiv.style.display = 'none';
        } catch (error) {
            carDataDiv.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
        }
    };

    const fetchAdvancedCarData = async (definitionId) => {
        try {
            console.log('Fetching advanced data for Definition ID:', definitionId);
            const response = await fetch('/fetchAdvancedCarData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ definitionId: String(definitionId) }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                advancedCarDataDiv.innerHTML = `<p>Error: ${errorText}</p>`;
                return;
            }

            const advancedData = await response.json();

            advancedCarDataDiv.innerHTML = `
                <h2>Vehicle Attributes</h2>
                ${advancedData.attributes.map(attr => `<p><strong>${attr.name}:</strong> ${attr.value}</p>`).join('')}
            `;

            advancedCarDataDiv.style.display = 'block';
        } catch (error) {
            advancedCarDataDiv.innerHTML = `<p>Error fetching advanced data: ${error.message}</p>`;
        }
    };

    const fetchRewardsHistory = async (tokenId) => {
        try {
            console.log('Fetching rewards history for Token ID:', tokenId);
            const response = await fetch('/fetchRewardsHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                carDataDiv.innerHTML = `<p>Error: ${errorText}</p>`;
                return;
            }

            const rewardsHistory = await response.json();

            advancedCarDataDiv.innerHTML = `
                <h2>Rewards History</h2>
                ${rewardsHistory.edges.map(edge => `
                    <p><strong>Week:</strong> ${edge.node.week}</p>
                    <p><strong>Connection Streak:</strong> ${edge.node.connectionStreak}</p>
                    <p><strong>Streak Tokens:</strong> ${edge.node.streakTokens}</p>
                    <p><strong>Aftermarket Device Tokens:</strong> ${edge.node.aftermarketDeviceTokens}</p>
                `).join('')}
            `;

            advancedCarDataDiv.style.display = 'block';
        } catch (error) {
            advancedCarDataDiv.innerHTML = `<p>Error fetching rewards history: ${error.message}</p>`;
        }
    };

    const shareOnTwitter = () => {
        if (!carData) {
            console.error("No car data available to share.");
            return;
        }

        const url = window.location.href;
        const text = encodeURIComponent(`Check out this car data: ID ${carData.id}, Make ${carData.definition.make}, Model ${carData.definition.model}, Year ${carData.definition.year}`);
        const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        window.open(twitterUrl, '_blank');
    };

    getCarDataButton.addEventListener('click', () => {
        const tokenId = tokenInput.value;
        if (tokenId) {
            fetchCarData(tokenId);
            window.history.pushState({}, '', `/token/${tokenId}`);
        }
    });

    getAdvancedDataButton.addEventListener('click', () => {
        if (carData && carData.definition && carData.definition.id) {
            fetchAdvancedCarData(carData.definition.id);
        }
    });

    getRewardsHistoryButton.addEventListener('click', () => {
        const tokenId = tokenInput.value;
        if (tokenId) {
            fetchRewardsHistory(tokenId);
        }
    });

    shareTwitterButton.addEventListener('click', () => {
        shareOnTwitter();
    });

    const tokenId = window.location.pathname.split('/').pop();
    if (tokenId && tokenId !== 'token') {
        tokenInput.value = tokenId;
        fetchCarData(tokenId);
    }
});
