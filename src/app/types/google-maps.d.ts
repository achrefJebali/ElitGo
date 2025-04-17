declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      [key: string]: any;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    namespace places {
      class Autocomplete {
        constructor(inputElement: HTMLInputElement, options?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): any;
        getPlace(): AutocompletePlace;
      }

      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: {country: string | string[]};
        fields?: string[];
        bounds?: any;
      }

      interface AutocompletePlace {
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
        formatted_address?: string;
        geometry?: {
          location: LatLng;
        };
        name?: string;
        place_id?: string;
      }
    }
  }
}
