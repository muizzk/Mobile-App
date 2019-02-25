import { socketHostPrice } from '../config';
import {
    setLocPriceWebsocketConnection
} from '../redux/action/exchangerSocket';
import {
    updateLocAmounts,
    clearLocAmounts
} from '../redux/action/locAmounts'
import {
    setSeconds
} from '../redux/action/locPriceUpdateTimer'
import store from '../redux/store';

import { getDate } from './debug'

const WEBSOCKET_RECONNECT_DELAY = 5000;
const DEFAULT_SOCKET_METHOD = 'getLocPrice';
const UNSUBSCRIBE_SOCKET_METHOD = 'unsubscribe';

class WS {
    static self;

    constructor() {
        console.log('@@exchangerWebsocket::constructor');
        console.log('@@@@@exchangerWebsocket  self', {self});
        
        WS.self = this;
        this.ws = null;
        this.grouping = false;
        this.shoudSocketReconnect = true;

        this.initSocket();
        this.locAmounts = [];

    }

    initSocket() {
        console.log('@@exchangerWebsocket [WS] initSocket', socketHostPrice);
        
        this.ws = new WebSocket(socketHostPrice);
        this.ws.onmessage = this.handleRecieveMessage;
        this.ws.onopen = this.connect;
        this.ws.onclose = () => { 
            console.log(`@@exchangerWebsocket [WS] onClose ${getDate()}, this`, this);
            this.close(this); 
        };
    }

    startGrouping(scehduleTime = 20 * 1000){
        console.log("exchangerWebsocket: LOC PRICE startGrouping")
        this.grouping = true;
        if (this.timerOut !== undefined && this.timerOut !== null) {
            clearTimeout(this.timerOut);
            this.timerOut = null;
        }
        console.log("exchangerWebsocket: LOC PRICE stopGrouping setInterval");
        this.timer = setInterval(this.onTick, scehduleTime);
    }

    stopGrouping() {
        console.log("exchangerWebsocket: LOC PRICE stopGrouping");
        const that = this;
        clearInterval(that.timer);
        that.timer = null;
        this.timerOut = setTimeout(()=>{
            console.log("exchangerWebsocket: LOC PRICE stopGrouping timerOut");
            that.grouping = false;
            that.timerOut = null;
        }, 10 * 1000);
    }

    onTick() {
        console.log('@@@@exchangerWebsocket [WS] exchangerWebsocket::onTick');
        
        let clonedLocAmounts = [...WS.self.locAmounts];
        WS.self.locAmounts = [];
        
        if (clonedLocAmounts.length > 0) {
            store.dispatch(updateLocAmounts(clonedLocAmounts));
        }
    }

    connect() {
        console.log(`@@exchangerWebsocket [WS] exchangerWebsocket::connect ${getDate()}`);
        
        store.dispatch(setLocPriceWebsocketConnection(true));
    }

    sendMessage(id, method, params, isMarked = false) {
        console.log(`@@@@exchangerWebsocket [WS] exchangerWebsocket::sendMessage ${getDate()}`, id, method, params, this.markedID);
        if (this.ws.readyState === 1 && id) {
            method = method ? method : DEFAULT_SOCKET_METHOD;
            if (isMarked) {
                if (method === DEFAULT_SOCKET_METHOD) {
                    this.markedID = id;
                }
                else if (method === UNSUBSCRIBE_SOCKET_METHOD){
                    this.markedID = null;
                }
            }
            if (!(method === UNSUBSCRIBE_SOCKET_METHOD && this.markedID === id)) {
                this.ws.send(JSON.stringify({ id, method, params }));
            }
        }
    }

    handleRecieveMessage(event) {
        console.log(`@@exchangerWebsocket [WS] exchangerWebsocket::handleRecieveMessage ${getDate()}`, event);
        
        if (event) {
            const data = JSON.parse(event.data);
            if (data.params && data.params.secondsLeft) {
                const seconds = Math.round(data.params.secondsLeft / 1000);
                store.dispatch(setSeconds(seconds));
            }
            if (!WS.self.grouping) {
                store.dispatch(updateLocAmounts({fiatAmount: data.id, params: data.params, error: data.error}));
            }
            else {
                // console.log("handleRecieveMessage gropuing", WS.self.locAmounts);
                WS.self.locAmounts = [...WS.self.locAmounts, {fiatAmount: data.id, params: data.params, error: data.error}];
            }
        }
    }

    close() {
        console.log(`@@exchangerWebsocket::close ${getDate()}`);
        
        if (this.shoudSocketReconnect) {
            if (store.getState().currency.isLocPriceWebsocketConnected) {
                store.dispatch(clearLocAmounts());
                store.dispatch(setLocPriceWebsocketConnection(false));
            }
            setTimeout(() => {
                this.initSocket();
            }, WEBSOCKET_RECONNECT_DELAY);
        }
    }

    disconnect() {
        console.log(`@@exchangerWebsocket [WS] 1/3 exchangerWebsocket::disconnect ${getDate()}`, event);
        
        this.shoudSocketReconnect = false;
        if (this.ws) {
            console.log('@@exchangerWebsocket [WS] 2/3 exchangerWebsocket::close');
            this.ws.close();
        }
    }
}

export default WS;
export const WebsocketClient = new WS();