/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPagination,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { Location } from 'history';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { IBucket } from '../../../../../server/lib/transactions/distribution/get_buckets/transform';
import { IUrlParams } from '../../../../context/UrlParamsContext/types';
import { history } from '../../../../utils/history';
import { fromQuery, toQuery } from '../../../shared/Links/url_helpers';
import { LoadingStatePrompt } from '../../../shared/LoadingStatePrompt';
import { TransactionSummary } from '../../../shared/Summary/TransactionSummary';
import { TransactionActionMenu } from '../../../shared/TransactionActionMenu/TransactionActionMenu';
import { MaybeViewTraceLink } from './MaybeViewTraceLink';
import { TransactionTabs } from './TransactionTabs';
import { IWaterfall } from './WaterfallContainer/Waterfall/waterfall_helpers/waterfall_helpers';

interface Props {
  urlParams: IUrlParams;
  location: Location;
  waterfall: IWaterfall;
  exceedsMax: boolean;
  isLoading: boolean;
  traceSamples: IBucket['samples'];
}

export function WaterfallWithSummmary({
  urlParams,
  location,
  waterfall,
  exceedsMax,
  isLoading,
  traceSamples,
}: Props) {
  const [sampleActivePage, setSampleActivePage] = useState(0);

  useEffect(() => {
    setSampleActivePage(0);
  }, [traceSamples]);

  const goToSample = (index: number) => {
    setSampleActivePage(index);
    const sample = traceSamples[index];
    history.push({
      ...history.location,
      search: fromQuery({
        ...toQuery(history.location.search),
        transactionId: sample.transactionId,
        traceId: sample.traceId,
      }),
    });
  };

  const { entryTransaction } = waterfall;
  if (!entryTransaction) {
    const content = isLoading ? (
      <LoadingStatePrompt />
    ) : (
      <EuiEmptyPrompt
        title={
          <div>
            {i18n.translate('xpack.apm.transactionDetails.traceNotFound', {
              defaultMessage: 'The selected trace cannot be found',
            })}
          </div>
        }
        titleSize="s"
      />
    );

    return <EuiPanel paddingSize="m">{content}</EuiPanel>;
  }

  return (
    <EuiPanel paddingSize="m">
      <EuiFlexGroup>
        <EuiFlexItem style={{ flexDirection: 'row', alignItems: 'center' }}>
          <EuiTitle size="xs">
            <h5>
              {i18n.translate('xpack.apm.transactionDetails.traceSampleTitle', {
                defaultMessage: 'Trace sample',
              })}
            </h5>
          </EuiTitle>
          {traceSamples && (
            <EuiPagination
              pageCount={traceSamples.length}
              activePage={sampleActivePage}
              onPageClick={goToSample}
              compressed
            />
          )}
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <TransactionActionMenu transaction={entryTransaction} />
            </EuiFlexItem>
            <MaybeViewTraceLink
              transaction={entryTransaction}
              waterfall={waterfall}
            />
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="s" />

      <TransactionSummary
        errorCount={waterfall.errorsCount}
        totalDuration={waterfall.rootTransaction?.transaction.duration.us}
        transaction={entryTransaction}
      />
      <EuiSpacer size="s" />

      <TransactionTabs
        transaction={entryTransaction}
        location={location}
        urlParams={urlParams}
        waterfall={waterfall}
        exceedsMax={exceedsMax}
      />
    </EuiPanel>
  );
}
