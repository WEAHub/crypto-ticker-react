import React, { Component } from 'react'
import axios from 'axios'
import Rodal from 'rodal';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Stack from '@material-ui/core/Stack';
import Divider from '@material-ui/core/Divider';
import { AdvancedChart } from "react-tradingview-embed"

import { ccapDB } from './ccapIndex'
import 'rodal/lib/rodal.css';
import './Ticker.css'

export default class Btcticker extends Component {

    constructor(props) {
        super(props)
        this.timerHwnd = null
        this.timerTime = this.props.time * 1000        
        this.ccId = -1
        this.state = { 
            price: 0, 
            priceEffect: false,
            priceDir: false,
            delete: false,
            shown: false,
            backgroundChart: '',
            alertPrice: 0, 
            alertModalVisible: false,
            alertEnabled: false,
            alertFire: false,
            alertMsg: '',
            alertCond: '',
        }
        this.closeTicker = this.closeTicker.bind(this)
    }

    async getPrice() {
        const pair = this.props.pair.replace('/', '')
        const price = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=' + pair)
        return price.data.price
    }

    async refreshPrice() {
        const newPrice = parseFloat(await this.getPrice()).toFixed(2)

        if(newPrice !== this.state.price) {
            this.setState({ 
                priceDir : newPrice > this.state.price,
                priceEffect: true,
                price: newPrice
            })
            
            if(this.state.alertEnabled) {   
                const alertCondition = this.state.alertCond === 0 ? 
                    this.state.alertPrice >= this.state.price :
                    this.state.alertPrice <= this.state.price

                if(alertCondition) {
                    // FIRE ALERT
                    this.setState({
                        alertMsg: `${this.props.pair} reached ${this.state.price}`,
                        alertFire: true
                    })

                }
            }

            setTimeout(() => this.setState({priceEffect: false}), 500)
        }

    }
    
    componentDidMount() {
        
        this.timerHwnd = setInterval(
            () => this.refreshPrice(),
            this.timerTime
        )

        setTimeout(() => {       
            this.ccId = this.getIDBySym(this.props.pair)            
            this.setState({
                shown: true,
                backgroundChart: this.ccId ? `https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/${this.ccId}.svg` : ''
            })
        }, 500)

    }

    componentWillUnmount() {
        clearInterval(this.timerHwnd)
    }

    closeTicker() { 
        this.setState({delete: true})
        this.componentWillUnmount()
        this.props.closeCallback(this.props.id)
    }

    getIDBySym(pair) {
        const firstPair = pair.split('/')[0]
        const res = ccapDB.filter(p => p.sym === firstPair)[0].id
        return res !== "undefined" ? res : null
    }

    setAlert() {
        //console.log(this.state.alertPrice)
        this.setState({ 
            alertEnabled: true
        })
        this.toggleModal();
    }

    toggleModal() { 
        this.setState({alertModalVisible: !this.state.alertModalVisible})
    }


    disableAlert() {
        this.setState({
            alertEnabled: false,
            alertModalVisible: false
        })
    }
    render() {
        
        const loadingSpin = <div style={{marginTop: '20px'}} className="lds-ring"><div></div><div></div><div></div><div></div></div>
        const priceDir = this.state.priceDir ? 'price-up' : 'price-down'
        const priceClass = ['price', (this.state.priceEffect ? ('price-effect ' + priceDir) : '')].join(' ');
        const priceValue = this.state.price ?  <p className={priceClass}>{this.state.price}</p> : loadingSpin
        const iconPath = `${process.env.PUBLIC_URL}img/${this.props.pair.split('/')[0].toUpperCase()}.svg`
        const bellPath = this.state.alertEnabled ? `${process.env.PUBLIC_URL}img/bellon.svg` : `${process.env.PUBLIC_URL}img/bell.svg`
        const tickerClass = ['ticker',
            this.state.shown ? 'ticker-shown' : '',
            this.state.delete ? 'ticker-delete' : ''
        ].join(' ')
    

        return (            
            <div 
                className={tickerClass}
                style={{
                    backgroundImage: `linear-gradient(45deg, #0d4cff, transparent), 
                        linear-gradient(196deg, #1139ae, transparent),
                        url(${this.state.backgroundChart})`
                }}
            >
                <Snackbar 
                    open={this.state.alertFire}
                    autoHideDuration={60000}
                    message={this.state.alertMsg}
                    onClose={e => this.setState({alertFire : false})}
                />

   

                <Rodal
                    width={300} height={150} 
                    className="alertModal" 
                    visible={this.state.alertModalVisible}
                    onClose={this.toggleModal.bind(this)}>
                     
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <div>Alert for {this.props.pair}</div>
                        </Grid>
                          
                        <Grid item xs={4}>
                            <Select
                                inputProps={{ 'aria-label': 'Without label' }}
                                value={0}
                                onChange={e => this.setState({alertCond: e.target.value})}
                            >
                                <MenuItem value={0}>Mayor</MenuItem>
                                <MenuItem value={1}>Menor</MenuItem>                                
                            </Select>
                        </Grid>
                        <Grid item xs={8}>

                            <TextField
                                onChange={e => {this.setState({alertPrice: e.target.value})}}
                                label="Price"
                                defaultValue={this.state.alertPrice}
                                type="number"
                                variant="standard" />

                        </Grid>
                        <Grid item xs={12}>
                            <Stack
                                direction="row" 
                                spacing={1}  
                                justifyContent="center"
                                alignItems="center"
                                divider={<Divider orientation="vertical" flexItem />}
                             >
                                <Button 
                                    onClick={this.setAlert.bind(this)} 
                                    variant="outlined"
                                >
                                    {this.state.alertEnabled ? 'Change' : 'Set'}
                                </Button>

                                <Button 
                                    onClick={this.disableAlert.bind(this)} 
                                    variant="outlined" 
                                    disabled={!this.state.alertEnabled}
                                >
                                    Disable
                                </Button>
                            </Stack>
                        </Grid>
                    
                    </Grid>
                
                </Rodal>

                <div className="closeTicker" onClick={this.closeTicker}>x</div>

                <div className="alertTicker" onClick={this.toggleModal.bind(this)}>
                    <img
                        alt={this.props.pair}
                        src={bellPath} 
                    />
                </div>

                <div className="tickerPair">
                    <img className="icon" 
                        alt={this.props.pair}
                        src={iconPath} 
                        onError={e => e.target.src = 'img/noicon.svg'}
                    />
                    {this.props.pair}
                </div>
                {priceValue}
            </div>
        )
    }
}
