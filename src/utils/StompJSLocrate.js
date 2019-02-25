import React, { Component } from 'react';
import { NativeModules, DeviceEventEmitter, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withNavigation } from 'react-navigation';
import { setLocEurRate } from '../redux/action/exchangeRates/'

import { socketHost, stompLocrateSocketPath } from '../config'

import { getDate } from './debug'

const stompModule = NativeModules.StompModule;

/**
 * This class is needed only for Android
 */
class StompJSLocrate extends Component {
    static stompJSClient = null;
    static connected = false;

    constructor(props) {
        super(props);
        console.log('@@StompJSLocrate constructor',{connected: StompJSLocrate.connected, client: StompJSLocrate.stompJSClient});

        this.createSocket = this.createSocket.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.removeListeners = this.removeListeners.bind(this);
    }

    componentDidMount() {
        this.createSocket();
        // this.disconnect();
        this.connect();
    }

    componentWillUnmount() {
        this.disconnect();
        this.removeListeners();
        stompModule.close();
    }

    createSocket() {
        const client = Stomp.client(socketHost);
        StompJSLocrate.stompJSClient = client;
        client.debug = msg => console.info('exchangerWebsocket [STOMP] DEBUG', msg);
    }

    connect() {
        console.log('@@StompJSLocrate [STOMP] connect() -> this', this);
        
        if (StompJSLocrate.connected) {
            console.log('@@StompJSLocrate [STOMP] connect() already connected - SKIPPING');
            return;
        }

        const onSubscribe = () => StompJSLocrate.stompJSClient.subscribe(
            stompLocrateSocketPath, 
            (data) => {
                console.info(`@@@@StompJSLocrate [STOMP] onSubscribe [${require('moment')().format('YYYY-MM-DD hh:mm:ss')}] [EVENT]`, {data,body:data.body});
                StompJSLocrate.connected = true;
                this.props.navigation.dispatch(setLocEurRate(Number(data.body)));
            }
        );

        this.addListeners();
        stompModule.connect(socketHost,stompLocrateSocketPath,false);

        StompJSLocrate.stompJSClient.connect(
            null,
            null,
            onSubscribe
        );
    }

    addListeners() {
        // if (Platform.OS === 'android') {
            DeviceEventEmitter.removeAllListeners("onStompConnect");
            DeviceEventEmitter.addListener("onStompConnect", () => {
                console.info(`@@@@StompJSLocrate  [STOMP][ANDROID] Connected`);

            });
            
            DeviceEventEmitter.removeAllListeners("onStompError");
            DeviceEventEmitter.addListener("onStompError", ({type, message}) => {
                console.info(`@@@@StompJSLocrate  [STOMP][ANDROID] Error ${getDate()}`,{type, message});
            });

            // DeviceEventEmitter.removeAllListeners("onStompMessage");
            DeviceEventEmitter.addListener("onStompMessage", ({message}) => {
                //const {message} = body;
                console.info(`@@@@StompJSLocrate  [STOMP][ANDROID] Message ${getDate()}`,{message,t:this});
                this.props.navigation.dispatch(setLocEurRate(Number(message)));

            });
        // }
    }

    removeListeners() {
        DeviceEventEmitter.removeAllListeners("onStompConnect");
        DeviceEventEmitter.removeAllListeners("onStompError");
        DeviceEventEmitter.removeAllListeners("onStompMessage");
    }

    disconnect() {
        if (StompJSLocrate.stompJSClient) {
            console.log('@@StompJSLocrate [STOMP] disconnect');
            StompJSLocrate.stompJSClient.disconnect();
            StompJSLocrate.stompJSClient = null;
        }
    }

    render() {
        return <View />
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setLocEurRate: bindActionCreators(setLocEurRate, dispatch)
    }
};

export default connect(null, mapDispatchToProps)(withNavigation(StompJSLocrate));