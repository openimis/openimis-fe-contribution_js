import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { useTheme, styled } from "@mui/material/styles";

import {
  historyPush,
  withModulesManager,
  withHistory,
  clearCurrentPaginationPage,
  injectIntl,
} from "@openimis/fe-core";
import ContributionSearcher from "../components/ContributionSearcher";

const StyledDiv = styled("div")(({ theme }) => ({
  ...(theme?.page ?? {}),
  '& .fab': theme?.fab ?? {},
}));

class ContributionsPage extends Component {
  onDoubleClick = (c, newTab = false) => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "contribution.contributionOverview",
      [c.uuid],
      newTab
    );
  };

    constructor(props) {
        super(props);
        let defaultFilters = {};
        this.state = {
          defaultFilters,
        };
      }

  componentDidMount = () => {
    const moduleName = "contribution";
    const { module } = this.props;
    if (module !== moduleName) this.props.clearCurrentPaginationPage();
  };

    render() {
        return (
            <StyledDiv className="page">
                <ContributionSearcher
                    cacheFiltersKey="contributionsPageFiltersCache"
                    onDoubleClick={this.onDoubleClick}
                    defaultFilters = {this.state.defaultFilters}
                />
            </StyledDiv>
        )
    }

}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export { ContributionsPage };

export { StyledDiv };
export default injectIntl(
  withModulesManager(
    withHistory(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(ContributionsPage)
    )
  )
);
