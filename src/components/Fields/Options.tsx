import React from "react";
import {
  Input,
  HStack,
  Stack,
  FormControl,
  FormLabel,
  Divider,
  Select,
} from "@chakra-ui/react";
import { $t } from "store/TranslationsContext";
import { usePage } from "store/PageContext";
import FieldHeader from "./FieldHeader";

interface Props {
  name: string;
  index: number;
  alias: string;
  options?: Array<string>;
}

const Toggler = ({ name, index, alias, options }: Props) => {
  const [page, dispatch] = usePage();
  const handleChangeValue = ({ target }: { target: HTMLSelectElement }) => {
    dispatch({
      type: "MODULE_PROP",
      payload: { name, value: target.value, index },
    });
  };
  return (
    <Stack width="100%" p={15}>
      <FieldHeader name={name} alias={alias} />
      <Divider />
      <HStack width="100%">
        <FormControl isRequired>
          <FormLabel>{$t("VALUE")}</FormLabel>
          <Select
            size="lg"
            key={`select-${index}`}
            placeholder={$t("SELECT_OPTION")}
            value={page.modules[index]?.props[name] || ""}
            isRequired
            onChange={handleChangeValue}
          >
            {options?.map((item: string) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>
    </Stack>
  );
};

export default Toggler;
