const axios = require('axios')
const qs = require('qs')
const crypto = require('crypto')
const config = require('config')
/*
    An unofficial xt.com sdk for js. this is build following the official xt.com API doc
    https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md 
*/

// TODO: move these constant to config file
const accessKey = ''
const secretKey = ''
const url = 'https://api.xt.com'

const httpClient = axios.create()
httpClient.defaults.timeout = 5000

/**
 * Return Kline/Candlestick data.
 *
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {string} type Kline type ex. '1min', '1hour'
 * @param {integer} since The condition. Control increment
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=Kline/Candlestick%20data
 */
const getKLine = async (pair, type, since) => {
    try {
        let response = await httpClient.get(`${url}/data/api/v1/getKLine?market=${pair}&type=${type}&since=${since}`)
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return aggregated markets data.
 *
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=Aggregated%20Markets%20%EF%BC%88Ticker%EF%BC%89
 */
const getTicker = async (pair) => {
    try {
        let response = await httpClient.get(`${url}/data/api/v1/getTicker?market=${pair}`)
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return market depth data.
 *
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=11604.08%2C%0A%20%20%20%20%22coinVol%22%3A%202944.208780%0A%20%20%7D%0A%7D-,Market%20Depth%20data,-GET%20/data/api
 */
const getDepth = async (pair) => {
    try {
        let response = await httpClient.get(`${url}/data/api/v1/getDepth?market=${pair}`)
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return latest market transaction record.
 *
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=Latest%20Market%20transactions%20record
 */
const getTrades = async (pair) => {
    try {
        let response = await httpClient.get(`${url}/data/api/v1/getTrades?market=${pair}`)
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return trading (spot) account assets.
 *
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=Get%20trading%20(spot)%20account%20assets
 */
const getBalance = async () => {
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now()
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.get(`${url}/trade/api/v1/getBalance`, { params: params })
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Place a new order.
 * 
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {float} price Order Price
 * @param {float} qty Order quantity
 * @param {integer} tradeType Trading type, 1 buy, 0 sell
 * @param {integer} entrustType Order type, 0 limit price, 1 market price
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=0.00%22%0A%20%20%20%20%7D%0A%20%20%7D%2C%0A%20%20%22info%22%3A%20%22success%22%0A%7D-,Place%20a%20new%20order,-POST%20/trade/api
 */
const order = async (pair, price, qty, tradeType, entrustType) => {
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now(),
        'market': pair,
        'price': price,
        'number': qty,
        'type': tradeType,
        'entrustType': entrustType
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.post(`${url}/trade/api/v1/order`, qs.stringify(params))
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Place bulk orders.
 * 
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {[]obj} data Order data 
 * Data is an array of object. The maximum length of the array is only 100. Anything beyond 100 will be ignored. ex.
 * [
 *   {"price": 1000, "amount": 1, "type": 1},
 *   {"price": 2000, "amount": 1, "type": 1}
 * ]
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=been%20placed%20successfully%22%0A%7D-,Bulk%20Orders,-POST%20/trade/api
 */
const batchOrder = async (pair, data) => {
    dataBase64 = _jsonArrToBase64(data)
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now(),
        'market': pair,
        'data': dataBase64
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.post(`${url}/trade/api/v1/batchOrder`, qs.stringify(params))
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Cancel an order
 * 
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {string} id An order id
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=been%20placed%20successfully%22%0A%7D-,Cancel%20an%20order,-POST%20/trade/api
 */
const cancel = async (pair, id) => {
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now(),
        'market': pair,
        'id': id
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.post(`${url}/trade/api/v1/cancel`, qs.stringify(params))
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Bulk cancel orders.
 * 
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {[]obj} data Order data 
 * Data is an array of object. The maximum length of the array is only 100. Anything beyond 100 will be ignored. The format of the array element is the order ID. such as:
 * ['123', '124', '125']
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=Cancel%20the%20Bulk%20Orders
 */
const batchCancel = async (pair, data) => {
    dataBase64 = _jsonArrToBase64(data)
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now(),
        'market': pair,
        'data': dataBase64
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.post(`${url}/trade/api/v1/batchCancel`, qs.stringify(params))
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

['6861018610614886401', '6861018610614886400', '6861013389431947264', '6861012731215233024']
/**
 * Return order information.
 *
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {string} id An order id 
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=been%20canceled%20successfully%22%0A%7D-,Order%20information,-GET%20/trade/api
 */
const getOrder = async (pair, id) => {
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now(),
        'market': pair,
        'id': id
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.get(`${url}/trade/api/v1/getOrder`, { params: params })
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return uncomplete orders.
 *
 * @param {string} pair A market pair ex. 'btc_usdt'
 * @param {integer} page page number default 1
 * @param {integer} pageSize page size default 10 range (10-1000)
 * @return {dict} ex. https://github.com/xtpub/api-doc/blob/3201018f19a3dc7d2de3af5074fc69dda4a49b80/rest-api-v1-en.md#:~:text=Get%20uncompleted%20Orders
 */
const getOpenOrders = async (pair, page = 1, pageSize = 10) => {
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now(),
        'market': pair,
        'page': page,
        'pageSize': pageSize
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.get(`${url}/trade/api/v1/getOpenOrders`, { params: params })
            .catch(err => {
                throw new Error(`${err.response.status}: ${err.response.statusText}`)
            })
        return response.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * [Internal] Return signature
 * 
 * @param {string} params a query params
 * @param {string} secretKey a key to sign the params
 * @return {string} signature from HmacSHA256 algorithm
 */
const _getSignature = (params, secretKey) => {
    const tempAry = [];
    for (let key in params) tempAry.push(key + '=' + params[key]);
    tempAry.sort();

    const queryString = tempAry.join('&');
    const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex')
    return signature;
}

/**
 * [Internal] Return base64 string
 * 
 * @param {[]obj} obj an array of an object
 * @return {string} base64 string
 */
const _jsonArrToBase64 = (obj) => {
    let objJsonStr = JSON.stringify(obj);
    let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
    return objJsonB64
}

module.exports = { getKLine, getTicker, getDepth, getTrades, getBalance, order, batchOrder, cancel, batchCancel, getOrder, getOpenOrders }
