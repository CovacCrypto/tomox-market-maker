const axios = require('axios')
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
 * [Internal] Return signature
 * 
 * @param {string} params a query params
 * @param {string} secretKey a key to sign the params
 * @return {string} signature from HmacSHA256 algorithm
 */
const _getSignature = (params, secretKey) => {
    let queryString = new URLSearchParams(params).toString();
    let signature = crypto.createHmac('sha256', secretKey, { 'encoding': 'utf8' }).update(queryString).digest('hex')
    return signature
}

module.exports = { getKLine, getTicker, getDepth, getTrades, getBalance }
