/**
 * Annotation layer in react
 *
 * @flow
 */

import * as React from 'react';

type Props = {};

export default class AnnotationLayer extends React.Component<Props> {
  render() {
    console.log('React Render!', this.props);

    return <div>Hello</div>;
  }
}
