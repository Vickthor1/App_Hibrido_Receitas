import "react-native";

declare module "react-native" {
  export const View: unknown;
  export const Text: unknown;
  export const Image: unknown;
  export const ScrollView: unknown;
  export const TouchableOpacity: unknown;
  export const TextInput: unknown;
  export const ActivityIndicator: unknown;
  export const RefreshControl: unknown;
  export const SafeAreaView: unknown;
}

declare global {
  namespace JSX {
    interface Element extends import("react").ReactElement<unknown, string> {}
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}
