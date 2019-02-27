import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import FontAwesome, { Icons } from 'react-native-fontawesome';
import Image from 'react-native-remote-svg';
import CardView from 'react-native-cardview'
import PropTypes from 'prop-types';
import { imgHost } from '../../../config';
import _ from 'lodash';
import FastImage from 'react-native-fast-image'
import { RoomsXMLCurrency } from '../../../services/utilities/roomsXMLCurrency';
import { CurrencyConverter } from '../../../services/utilities/currencyConverter'
import LocPrice from '../../atoms/LocPrice'

import styles from './styles';

//@@@
const isDebug = false;
class HotelItemView extends Component {
    static propTypes = {
        item: PropTypes.object | PropTypes.array,
        gotoHotelDetailsPage: PropTypes.func.isRequired,
        daysDifference: PropTypes.number,
        isDoneSocket: PropTypes.bool.isRequired
    };

    static defaultProps = {
        item: [],
        daysDifference : 1,
        isDoneSocket: false
    };

    constructor(props) {
        super(props);

        this.renderPrice = this.renderPrice.bind(this);
    }

    onFlatClick = (item) => {
        debugger;
        //@@@@
        // if (item.price != null) {
            this.props.gotoHotelDetailsPage(item);
        // }
    }

    renderStars = (count) => {
        const indents = [];
        for (let i = 0; i < count; i ++) {
            indents.push(<Text key = {`star - ${i}`} style={{ color: '#a3c5c0' }}><FontAwesome>{Icons.star}</FontAwesome></Text>);
        }
        for (let i = count; i < 5; i ++) {
            indents.push(<Text key = {`star - ${i}`} style={{ color: '#dddddd' }}><FontAwesome>{Icons.star}</FontAwesome></Text>);
        }
        return indents;
    }

    // ratingTitle = (count) => {
    //     if (count <= 1){
    //         return 'Poor'
    //     }
    //     else if (count > 1 && count <= 2){
    //         return 'Fair'
    //     }
    //     else if (count > 2 && count <= 3){
    //         return 'Good'
    //     }
    //     else if (count > 3 && count <= 4){
    //         return 'Very Good'
    //     }
    //     else if (count > 4 && count <= 5){
    //         return 'Excellent'
    //     }
    // }

    renderPrice(isDoneSocket, isLoadingPricing, price, currencySign, itemPrice) {
        return (
            isLoadingPricing
                ?
                    <View style={styles.costView}>
                        {
                            isDoneSocket ?
                            <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">Unavailable</Text>
                            :
                            <Text style={{
                                fontFamily:'Verdana',
                                fontSize: 10,
                                color:"#999",
                                shadowColor: 'black', 
                                shadowOffset: {width: 5,height: 5}
                            }}>Loading price...</Text>
                        }
                            {/* <Image style={{width:35, height:35}} source={require('../../../assets/loader.gif')}/> */}
                    </View>
                :
                    <View style={styles.costView}>
                        <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">{currencySign}{parseFloat(price).toFixed(2)}</Text>
                        {/* <Text style={styles.costLoc} numberOfLines={1} ellipsizeMode="tail"> (LOC {parseFloat(price/locRate).toFixed(2)}) </Text> */}
                        <LocPrice style= {styles.costLoc} fiat={price / this.props.daysDifference} fromParentType={0}/>
                        <Text style={styles.perNight}>per night</Text>
                    </View>
        )
    }

    render() {
        const {
            item, currencySign, isDoneSocket, exchangeRates, currency
        } = this.props;
        
        let urlThumbnail = item.hotelPhoto != undefined && item.hotelPhoto != null?
                 (_.isString(item.hotelPhoto) ? imgHost + item.hotelPhoto : imgHost + item.hotelPhoto.url) 
                 : 
                 "";
        let stars = item.star;
        let isLoadingPricing = true;
        let price; 
        let itemPrice; 

        if (item && item.price != null) {
            isLoadingPricing = false;
            itemPrice = item.price;
            let tmpPrice = CurrencyConverter.convert(
                exchangeRates.currencyExchangeRates,
                RoomsXMLCurrency.get(), 
                currency, 
                item.price);
            price = exchangeRates.currencyExchangeRates && (tmpPrice / this.props.daysDifference).toFixed(2);
        }

        //
        if (isDebug){
            price = 1000.8
            itemPrice = 10;
            isLoadingPricing = false;
            var isDoneSocket2 = true;
        }

  
        return (
            <TouchableOpacity onPress={() => this.onFlatClick(item)}>
                <CardView 
                    style = {styles.card}
                    cardElevation = {0.5}
                    cardMaxElevation = {0.5}
                    cornerRadius = {0}>
                    <View style={styles.popularHotelsImage}>
                        {
                            urlThumbnail != null && urlThumbnail != "" &&
                            <FastImage
                                style={{flex:1}}
                                source={{
                                    uri: urlThumbnail,
                                    priority: FastImage.priority.high,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        }
                        <TouchableOpacity style={styles.favoritesButton}>
                            <Image source={require('../../../assets/png/heart.png')} style={styles.favoriteIcon} resizeMode='contain'/>
                        </TouchableOpacity>
                        {/* isDebug ? <Text>DEBUG MODE</Text> : null @@@@@ */}
                    </View>


                    <View style={styles.cardContent}>

                        <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>

                        <View style={styles.aboutPlaceView}>
                            {/* <Text style={styles.placeReviewText}>{this.ratingTitle(stars)}</Text> */}
                            <Text style={styles.placeReviewNumber}> {stars}/5 </Text>
                            <View style={styles.ratingIconsWrapper}>
                                {this.renderStars(stars)}
                            </View>
                            {/* <Text style={styles.totalReviews}> 73 Reviews </Text> */}
                        </View>

                        { this.renderPrice      (isDebug ? isDoneSocket2 : isDoneSocket, isLoadingPricing, price, currencySign, itemPrice) }
                    </View>
                </CardView>
            </TouchableOpacity>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currency: state.currency.currency,
        currencySign: state.currency.currencySign,
        
        locAmounts: state.locAmounts,
        exchangeRates: state.exchangeRates,
    };
}
export default connect(mapStateToProps, null)(HotelItemView);