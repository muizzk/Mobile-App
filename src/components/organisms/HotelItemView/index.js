import React, { Component } from 'react';
import {
        Text,
        TouchableOpacity,
        View,
        Dimensions,
        ViewPropTypes
      } from 'react-native';
import Image from 'react-native-remote-svg';
import PropTypes from 'prop-types';
import { imgHost } from '../../../config';
import styles from './styles';
import FontAwesome, { Icons } from 'react-native-fontawesome';

const dimensionWindows = Dimensions.get('window');
const logoWidth = dimensionWindows.width;

const RNViewPropTypes = ViewPropTypes || View.propTypes;
const RNPropTypes = PropTypes || React.PropTypes;

class HotelItemView extends Component {

    static propTypes = {
        item: RNPropTypes.array,
        currencySign: RNPropTypes.object,
        locRate: RNPropTypes.number,
        gotoHotelDetailsPage: PropTypes.func.isRequired,
    };

    static defaultProps = {
        item: [],
        currencySign: undefined,
        locRate: 0
    };

    constructor(props) {
        super(props);
        this.onFlatClick = this.onFlatClick.bind(this);
    }

    onFlatClick(item) {
        this.props.gotoHotelDetailsPage(item);
    }

    checkStars(count){
        var indents = [];
        for (var i =0; i < 5; i++){
            if (count > 0){
                indents.push(<Text style={{color: '#a3c5c0'}}><FontAwesome>{Icons.star}</FontAwesome></Text>);
            }
            else{
                indents.push(<Text style={{color: '#dddddd'}}><FontAwesome>{Icons.star}</FontAwesome></Text>);
            }
            count--;
        }
        return indents;
    }

    render() {
        const {
            item, currencySign, locRate
        } = this.props;
        return (
            <TouchableOpacity onPress={() => this.onFlatClick(item)}>
            <View style={styles.card}>
            
            <Image 
            source={ item.thumbnail !== null && {uri : imgHost + item.thumbnail.url} } 
            style={styles.popularHotelsImage}/>

            <TouchableOpacity style={styles.favoritesButton}>
                <Image source={require('../../../assets/png/heart.png')} style={styles.favoriteIcon}/>
            </TouchableOpacity>
                    
                    <View style={styles.cardContent}>
                        
                        <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                        
                        <View style={styles.aboutPlaceView}>
                            <Text style={styles.placeReviewText}>Excellent </Text>
                            <Text style={styles.placeReviewNumber}> {item.stars}/5 </Text>
                            <View style={styles.ratingIconsWrapper}>
                                {this.checkStars(item.stars)}
                            </View>
                            {/* <Text style={styles.totalReviews}> 73 Reviews </Text> */}
                        </View>
                        
                        <View style={styles.costView}>
                            <Text style={styles.cost} numberOfLines={1} ellipsizeMode="tail">{currencySign}{item.price}</Text>
                            <Text style={styles.costLoc} numberOfLines={1} ellipsizeMode="tail"> (LOC {parseFloat(item.price/locRate).toFixed(2)}) </Text>
                            <Text style={styles.perNight}>per night</Text>
                        </View>
                    </View>
            </View>
            </TouchableOpacity>
        );
    }
}

export default HotelItemView;
