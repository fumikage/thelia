import React from 'react';
import { useSelector } from 'react-redux';

import Alert from '../Alert';
import Loader from '../Loader';
import priceFormat from '@utils/priceFormat';

import { useIntl } from 'react-intl';
import useValidDeliveryModules from './hooks/useValidDeliveryModules';
import {
  queryClient,
  useGetCheckout,
  useSetCheckout
} from '@openstudio/thelia-api-utils';
import Title from '../Title';

function getModuleValidOptions(module: any) {
  return module?.options?.filter((o: any) => o.valid) || [];
}

function ModuleOption({
  module = {},
  option = {},
  isSelected
}: {
  module: any;
  option: any;
  isSelected: boolean;
}) {
  const intl = useIntl();
  const { data: checkout } = useGetCheckout();
  const { mutate } = useSetCheckout();

  return (
    <label htmlFor={`option_${option?.code}`} className="Radio">
      <input
        type="radio"
        name="radio"
        id={`option_${option?.code}`}
        checked={isSelected}
        onChange={() => {
          if (module.deliveryMode === 'delivery') {
            mutate({
              ...checkout,
              deliveryModuleId: module.id,
              deliveryModuleOptionCode: option.code,
              pickupAddress: null
            });
          } else {
            queryClient.setQueryData('checkout', (oldData: any) => {
              return {
                ...oldData,
                deliveryModuleId: module.id,
                deliveryModuleOptionCode: option.code
              };
            });
          }
        }}
      />
      <div className="flex flex-wrap">
        <span
          className={`mr-6 block text-base ${isSelected ? 'text-main' : ''}`}
        >
          {module?.i18n?.title}
        </span>
        <strong className="text-main">
          {option.postage
            ? `${priceFormat(option.postage)}`
            : intl.formatMessage({ id: 'FREE' })}
        </strong>
      </div>
    </label>
  );
}

export default function DeliveryModules() {
  const intl = useIntl();

  const selectedMode = useSelector((state: any) => state.checkout.mode);
  const { data: checkout } = useGetCheckout();
  const { data: modules, isLoading } = useValidDeliveryModules(selectedMode);

  return (
    <>
      {isLoading ? (
        <Loader className="mx-auto mt-8 w-40" />
      ) : modules?.length === 0 ||
        modules?.flatMap(getModuleValidOptions).length === 0 ? (
        <Alert
          title={intl.formatMessage({ id: 'WARNING' })}
          message={intl.formatMessage({ id: 'NO_DELIVERY_MODE_AVAILABLE' })}
          type="warning"
          className="mt-8"
        />
      ) : (
        <div className="flex-start item-start mt-8 flex flex-col gap-3">
          <Title
            className="Title--3 mb-5 text-2xl"
            title="CHOOSE_DELIVERY_PROVIDER"
          />
          {modules.map((module: any) =>
            getModuleValidOptions(module).map((option: any) => (
              <ModuleOption
                key={module.code}
                module={module}
                option={option}
                isSelected={
                  checkout && checkout?.deliveryModuleOptionCode === option.code
                }
              />
            ))
          )}
        </div>
      )}
    </>
  );
}