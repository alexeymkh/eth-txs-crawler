# Eth txs crawler

1. Get Etherscan free API key: https://etherscan.io/apis
2. Add your Etherscan API key to ETHERSCAN_API_KEY variable in .env file
3. Uncomment `volume` sections in `docker-compose.yml` file if you want to store data
4. Run `docker-compose up` to start server
5. Make a GET request `http://localhost:3000/transactions?address=0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f&startBlock=17833576&page=1&offset=10`. Change query parameters as you need. You will get transactions in descending order until startBlock.