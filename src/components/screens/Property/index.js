import { 
    BackHandler, Platform, Text, View, WebView, TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import { connect } from 'react-redux';

// import BackButton from '../../atoms/BackButton';
import UUIDGenerator from 'react-native-uuid-generator';
import styles from './styles';
// import Icon from "react-native-vector-icons/SimpleLineIcons"
import IconAwesome from "react-native-vector-icons/FontAwesome"
// import IconMaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons"
import ProgressDialog from '../../atoms/SimpleDialogs/ProgressDialog';

import { basePath } from '../../../config'

let baseHomeUrl = basePath + 'homes/listings/?'
let baseHotelUrl = basePath + 'mobile/hotels/listings?'

class Property extends Component {
    iconSize = 30;

    webViewRef = {
        canGoBack: false,
        ref: null,
    };

    debug = () => {
        require('moment')().format('HH:MM:SS')
    }
    
    constructor(props) {
        super(props);

        console.log(`[${this.debug()}]@#@ [Property] Constructor `, {props});
        

        UUIDGenerator.getRandomUUID((uuid) => {
            uid = uuid;
        }); 
        console.disableYellowBox = true;
        this.state = {
            guests: 0,
            //these state are for paramerters in urlForService
            countryId: 0,
            regionId: '',
            checkInDateFormated: '',
            checkOutDateFormated: '',
            roomsDummyData: [],
            urlForService:'',
            isHotelSelected: false,
            webViewUrl: '',
            email:'',
            token:'',
            canGoBack: false,
            canGoForward: false,
            canGoToResults: false,
            showProgress: true
        };
        const { params } = this.props.navigation.state;
        this.state.guests = params ? params.guests : 0;

        this.state.isHotelSelected = params? params.isHotelSelected : false;
        this.state.countryId = params ? params.countryId : 0;
        this.state.regionId = params ? params.regionId : 0;
        this.state.checkInDateFormated = params ? params.checkInDateFormated  : '';
        this.state.checkOutDateFormated = params ? params.checkOutDateFormated  : '';
        this.state.roomsDummyData = params ? params.roomsDummyData : [];
        this.state.email = params? params.email : '';
        this.state.token = params? params.token : '';
      
        this.state.urlForService = 'region='+this.state.regionId+'&currency='+this.props.currency+'&startDate='+this.state.checkInDateFormated+'&endDate='+this.state.checkOutDateFormated+'&rooms='+this.state.roomsDummyData;
        
        this.generateSearchUrl()

        this.onBackPress = this.onBackPress.bind(this);
        this.onForwardPress = this.onForwardPress.bind(this);
        this.onResultsPress = this.onResultsPress.bind(this);
        this.onWebViewLoadStart = this.onWebViewLoadStart.bind(this);
        this.onWebViewLoadEnd = this.onWebViewLoadEnd.bind(this);
        this.onWebViewNavigationState = this.onWebViewNavigationState.bind(this);
        console.log('Received Params', params)
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress');
        }
    }

    generateSearchUrl() {
        var paramUrl = ''
        if ( !this.state.isHotelSelected ) {
            paramUrl = baseHomeUrl
            paramUrl += 'countryId=' + this.state.countryId
                     + '&startDate=' + this.state.checkInDateFormated
                     + '&endDate=' + this.state.checkOutDateFormated
                     + '&guests=' + this.state.guests
                     + '&priceMin=1&priceMax=5000'
                     + '&currency=' + this.props.currency
        } else {
            paramUrl = baseHotelUrl
            this.state.urlForService = 'region='+this.state.regionId+'&currency='+this.props.currency+'&startDate='+this.state.checkInDateFormated+'&endDate='+this.state.checkOutDateFormated+'&rooms='+this.state.roomsDummyData
            paramUrl += this.state.urlForService
        }
        paramUrl += '&authEmail=' + this.state.email + '&authToken=' + this.state.token.replace(' ', '%20')
        this.state.webViewUrl = paramUrl

        console.log("Propery - generateSearchUrl", paramUrl);
    }

    onResultsPress(event) {
        this.webViewRef.ref.goBack();
        this.webViewRef.ref.goBack();
        this.webViewRef.ref.goBack();
        this.webViewRef.canGoBack = false;
        this.setState({canGoBack: false});
        this.setState({canGoForward: true});
    }

    onBackPress(event) {
        if (this.state.canGoBack) {
            this.webViewRef.ref.goBack();
        }
    }

    onForwardPress(event) {
        console.log('##forward', {wview:this.webViewRef, event});
        
        this.webViewRef.ref.goForward();
    }


    onWebViewLoadStart(event) {
        console.log(`[${this.debug()}]@#@Load Started`,{wview:this.webViewRef});
    }

    onWebViewLoadEnd(event) {
        console.log(`[${this.debug()}]@#@Load Ended`,{wview:this.webViewRef});
        this.setState({showProgress: false});
    }

    onWebViewNavigationState(navState) {
        this.webViewRef.canGoBack = navState.canGoBack;
        this.setState({canGoBack:navState.canGoBack})
        this.setState({canGoForward:navState.canGoForward})
        console.log(`[${this.debug()}]@#@ onNavigationState`,{navState})
    }

    onAndroidBackPress = () => {
        if (this.webViewRef.canGoBack && this.webViewRef.ref) {
            console.log('android backbutton pressed in webview.....');
            this.webViewRef.ref.goBack();
            return true;
        } else if (!this.webViewRef.canGoBack && this.webViewRef.ref) {
            //
        }
    
        return false;
    }

    renderButton(type) {
        let result = null;
        switch (type) {
            case 'filters':
                result = (
                    <View style={[
                            styles.topBarButtonContainer,
                            {
                                // backgroundColor:'yellow',
                                // alignSelf: 'center'
                            }
                        ]}
                    >
                        {/* <BackButton style={{alignSelf:'flex-start',marginRight:10}} onPress={this.onBackPress}/> */}
                        <IconAwesome name={"filter"} size={this.iconSize} />
                        <Text style={styles.buttonText}>Filters</Text>
                    </View>
                );
                break;
            case 'back':
                const extraStyleBack = (this.state.canGoBack ? {opacity: 1} : {opacity: 0.1})
                result = (
                    <View style={[
                            styles.topBarButtonContainer,
                            extraStyleBack,
                            {
                                // backgroundColor:'yellow',
                                // alignSelf: 'center'
                            }
                        ]}
                    >
                        {/* <BackButton style={{alignSelf:'flex-start',marginRight:10}} onPress={this.onBackPress}/> */}
                        <IconAwesome name={"arrow-left"} size={this.iconSize} onPress={this.onBackPress} />
                        <Text style={styles.buttonText}>Back</Text>
                    </View>
                );
                break;
            case 'map':
                    result = (
                        <View style={[
                                styles.topBarButtonContainer,
                                {
                                    // backgroundColor:'yellow',
                                    // alignSelf: 'center'
                                }
                            ]}
                        >
                            <IconAwesome name="map" size={this.iconSize} style={{alignSelf:"flex-end"}} />
                            <Text style={styles.buttonText}>Map</Text>
                        </View>
                    );
                break;
            case 'results':
                const extraStyleResults = (this.state.canGoToResults ? {opacity: 1} : {opacity: 0.1})
                result = (
                    <TouchableOpacity onPress={this.onResultsPress} 
                        style={{
                            alignSelf:'flex-end'
                            }}
                    >                            
                        <View style={[styles.topBarButtonContainer,
                                extraStyleResults,
                                {
                                    // backgroundColor:'pink',
                                    // justifyContent:"space-around",
                                    borderColor: 'green',
                                }
                            ]}
                        >
                            <IconAwesome name="list" size={this.iconSize} />
                            <Text style={styles.buttonText}>Results</Text>
                            {/* <BackButton style={styles.closeButton} onPress={() => this.onResultsPress()}> */}
                        </View>
                    </TouchableOpacity>
                )
        }

        return result;
    }

    renderIcon(type, name, onPressFunc) {
        console.log('###',name);
        let result = null;

        switch (type) {
            case 'forward':
                const canGoForward = this.state.canGoForward;
                result = (
                    canGoForward
                    ?
                    <TouchableOpacity onPress={onPressFunc} >
                        <IconAwesome name={name} size={this.iconSize} />
                    </TouchableOpacity>
                    :
                    <View />
                );
                break;
        }
        
        return (
            <View style={{
                // backgroundColor: 'orange', 
                borderWidth:0, 
                // width: size,
                // height: size,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'flex-end',
                // borderColor:'orange',
                // borderRadius: size*3/4,
                marginHorizontal:40,
                shadowOffset: {width: 0, height: 0},
                shadowColor: 'red',
                shadowOpacity: 0.5,
                shadowRadius: 5
            }}>
                {result}
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topBar}>
                    { this.renderButton('back')         }
                    { this.renderButton('filters')      }
                    { this.renderButton('map')          }
                    { this.renderButton('results')      }
                </View>
                <View style={styles.content}>
                    <WebView
                        ref={(webViewRef) => { this.webViewRef.ref = webViewRef; }}
                        onNavigationStateChange = {this.onWebViewNavigationState}
                        onLoadStart={this.onWebViewLoadStart}
                        onLoadEnd={this.onWebViewLoadEnd}
                        style = {styles.webView}
                        source = {{ 
                            uri: this.state.webViewUrl
                        }}
                        // injectedJavaScript={jsCode}
                        // javaScriptEnabled={true}
                    />
                </View>
                <View style={{
                    flexDirection:'row',
                    position:'absolute',
                    justifyContent: 'space-between',
                    width:'100%',
                    // backgroundColor:'red',
                    top: "90%",

                }}>
                    {/* { this.renderIcon('globe-alt') } */}
                    <View />
                    {/* { this.renderIcon('map') } */}
                    { this.renderIcon('forward','arrow-right', this.onForwardPress) }
                </View>
                <ProgressDialog
                   visible={this.state.showProgress}
                   title=""
                   message={`Loading Results for '${this.props.search}'`}
                   animationType="slide"
                   activityIndicatorSize="large"
                   activityIndicatorColor="black"/>
            </View>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency
    };
}
export default connect(mapStateToProps, null)(Property);
