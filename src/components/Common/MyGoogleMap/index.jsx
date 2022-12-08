import React, { PureComponent } from "react";
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon
} from "reactstrap";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";

// Component(s)
import Loading from '../Loading';

// Assets
import "./styles.scss";

/** @var {String} */
// AIzaSyCSElrUZCq_hYVlAH-Bg_2MJp8m-nmpR4g
const GOOGLE_MAP_URL = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD3QyZQGVy4ELyZxs4G1k5hU0fVHbzQqz4&v=3.exp&libraries=geometry,drawing,places";

/**
 * MyGoogleMapComponent
 * @see https://tomchentw.github.io/react-google-maps/#introduction
 */
const MyGoogleMapComponent = withScriptjs(withGoogleMap((props) => {
  // console.log('MyGoogleMapComponent: ', props);
  const {
    /** @var {Object} */
    google
  } = window;
  let {
    isMarkerShown,
    ...mapProps
  } = props;

  return (
    <GoogleMap {...mapProps}>
      <SearchBox
        // ref={props.onSearchBoxMounted}
        // bounds={props.bounds}
        controlPosition={google.maps.ControlPosition.TOP_CENTER}
        onPlacesChanged={props.onPlacesChanged}
      >
        <InputGroup
          style={{
            width: `320px`,
            marginTop: `10px`,
          }}
        >
          <Input
            type="text"
            placeholder="Nhập địa chỉ"
            style={{
              textOverflow: `ellipses`,
            }}
          />
          <InputGroupAddon addonType="append">
            <Button color="primary" size="sm">
              <i className="fa fa-map-marker" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </SearchBox>
      {isMarkerShown && <Marker position={mapProps.defaultCenter} />}
    </GoogleMap>
  );
}));

/**
 * @class MyGoogleMap
 */
export default class MyGoogleMap extends PureComponent {
  constructor(props) {
    super(props);

    // Bind method(s)
    this.handleCloseGMap = this.handleCloseGMap.bind(this);

    // Init state
    this.state = {
      mapProps: {
        // ---
        googleMapURL: GOOGLE_MAP_URL,
        loadingElement: <Loading />,
        containerElement: <div style={{ height: `100%` }} />,
        mapElement: <div style={{ height: `100%` }} />,
        // ---
        isMarkerShown: true,
        defaultZoom: 12,
        defaultCenter: { lat: -34.397, lng: 150.644 }
      },
      markers: [],
    };
  }

  handleCloseGMap(evt) {
    let { onCloseGMap } = this.props;
    onCloseGMap && onCloseGMap(evt);
  }

  render() {
    let {
      mapProps,
      // markers,
    } = this.state;

    return (
      <div className="my-google-map">
        <div className="my-gmap-box">
          <div className="my-gmap-tools">
            <Button color="danger" onClick={this.handleCloseGMap}>
              <i className="fa fa-window-close" />
            </Button>
          </div>
          <MyGoogleMapComponent {...mapProps} />
        </div>
      </div>
    );
  }
}
