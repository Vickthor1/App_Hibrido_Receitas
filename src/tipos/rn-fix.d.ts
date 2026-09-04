import * as RN from "react-native";
import * as React from "react";

declare module "react-native" {
  export const View: React.FC<RN.ViewProps>;
  export const Text: React.FC<RN.TextProps>;
  export const Image: React.FC<RN.ImageProps>;
  export const ScrollView: React.FC<RN.ScrollViewProps>;
  export const TouchableOpacity: React.FC<RN.TouchableOpacityProps>;
  export const TextInput: React.FC<RN.TextInputProps>;
  export const ActivityIndicator: React.FC<RN.ActivityIndicatorProps>;
  export const RefreshControl: React.FC<RN.RefreshControlProps>;
  export const SafeAreaView: React.FC<RN.ViewProps>;
}
