import React, {useEffect} from 'react'
import Select from 'react-select'
import axios from 'axios'
import Ticker from '../Ticker/Ticker'
import './TickerControl.css'

export default function TickerControl() {
    const [coinList, setCoinList] = React.useState([])
    let [tickerList, setTickerList] = React.useState([])

    async function getCoinList() {
        const jsonList = await axios.get('https://api.binance.com/api/v3/exchangeInfo')
        const coinList = jsonList.data.symbols.filter( p => p.status === "TRADING" ).map( f => {
            const pair = `${f.baseAsset}/${f.quoteAsset}`;
            return { 
                value: pair,
                label: `Binance - ${pair}`
            }
        })

        return coinList
    }

    function genKey() {
        return (Math.random() + 1).toString(36).substring(7)
    }

    function addTicker(pair) {
        const key = genKey()
        setTickerList(tickerList => [...tickerList, <Ticker id={key} key={key} pair={pair} time={3} closeCallback={CbCloseTicker} />])
    }
 

    function CbCloseTicker(key) {
        setTimeout(() => setTickerList(tickerList => tickerList.filter(t => t.props.id !== key)), 500)
    }

    function handleSelectChange(e) {
        if(e !== "undefined") addTicker(e.value)
    }

    useEffect(() => getCoinList().then((list) => {
        setCoinList(list);
        [
            "BTC/USDT", 
            "ETH/USDT", 
            "NEO/USDT"
        ]
        .forEach(i => {
            const key = genKey()
            setTickerList(tickerList => 
                [...tickerList, <Ticker id={key} key={key} pair={i} time={5} closeCallback={CbCloseTicker} />]
            )
        }) 
    }), [])
    

    return (
        <div>
            <div style={{
                margin: '25px auto',
                width: '300px',
                background: '#ffffff2e',
                padding: '15px',
                borderRadius: '5px'
            }}>
                <Select
                    maxMenuHeight={200} 
                    options={coinList}
                    defaultValue={coinList[0]}
                    onChange={handleSelectChange}
                />
            </div>            
            <div className="tickerList">
                {tickerList}
            </div>
        </div>
    )
}

