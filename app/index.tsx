/**
 * @fileoverview Entry route for the EAV Field application.
 * @remarks Authentication is mocked during the portfolio foundation milestone.
 */

import { Redirect } from 'expo-router';

export default function IndexRoute() {
  return <Redirect href="/(auth)/login" />;
}
