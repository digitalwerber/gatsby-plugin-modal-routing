import _ from 'lodash'
import React from 'react'
import Modal from 'react-modal'
import ModalRoutingContext from './ModalRoutingContext'
import { navigate } from "gatsby";

class ReplaceComponentRenderer extends React.Component {
  state = {
    prevProps: null,
    props: null,
    pathname: null,
  }

  constructor(...args) {
    super(...args);

    this.closeModal = this.closeModal.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    // TODO: handle history changes
    if (props.location.pathname !== state.pathname) {
      return {
        pathname: props.location.pathname,
        props: props,
        // only set as prev props if not a modal
        ...(!_.get(state, 'props.location.state.modal') && {
          prevProps: state.props
        })
      }
    }
  }

  closeModal() {
    const { prevProps } = this.state;
    navigate(prevProps.location.pathname, {
      state: {
        noScroll: true
      }
    });
  }

  render() {
    // render modal if props location has modal
    const { pageResources, location, modalProps } = this.props
    const { prevProps } = this.state
    const isModal = prevProps && _.get(location, 'state.modal')

    const resources = isModal ?
      prevProps.pageResources : pageResources

    const pageElement = isModal ? (
      React.createElement(prevProps.pageResources.component, {
        ...prevProps,
        key: prevProps.pageResources.page.path,
      })
    ) : (
      React.createElement(pageResources.component, {
        ...this.props,
        key: pageResources.page.path,
      })
    )

    const modalElement = isModal ? React.createElement(pageResources.component, {
      ...this.props,
      key: pageResources.page.path,
    }) : null

    return (
      <>
        {pageElement}

        <Modal
          {...modalProps}
          isOpen={!!modalElement}
          onRequestClose={this.closeModal}
        >
          {modalElement ? (
            <React.Fragment
              key={this.props.location.key}
            >
              <ModalRoutingContext.Provider
                value={{ modal: isModal, closeTo: prevProps.location.pathname }}
              >
                {modalElement}
              </ModalRoutingContext.Provider>
            </React.Fragment>
          ) : null}
        </Modal>
      </>
    )
  }
}

const replaceComponentRenderer = ({ props }, opts) => {
  const { modalProps } = opts
  return React.createElement(ReplaceComponentRenderer, { ...props, modalProps })
}

export default replaceComponentRenderer
