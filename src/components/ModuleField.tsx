import React, { ReactElement } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Flex,
  Select,
  IconButton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FiMinus } from "react-icons/fi";
import { $t } from "store/TranslationsContext";

interface FieldProps {
  name: string;
  type: string;
  index?: number;
  handleField: Function;
  handleRemoveField: Function;
}

const Field = ({
  name,
  type,
  index,
  handleField,
  handleRemoveField,
}: FieldProps): ReactElement => {
  return (
    <Grid templateColumns="16fr 16fr 1fr" gap={5} width="100%">
      <GridItem>
        <FormControl id="name" isRequired>
          <FormLabel as="legend">{$t("FIELD_NAME")}</FormLabel>
          <Input
            size="lg"
            key={`input-${index}`}
            type="text"
            isRequired
            autoComplete="false"
            value={name}
            onChange={(e) => {
              e.preventDefault();
              handleField({
                is: "name",
                value: e.target.value,
                index,
              });
            }}
          />
        </FormControl>
      </GridItem>
      <GridItem>
        <FormControl id="type" isRequired>
          <FormLabel>{$t("FIELD_TYPE")}</FormLabel>
          <Select
            size="lg"
            key={`select-${index}`}
            placeholder={$t("SELECT_OPTION")}
            value={type}
            isRequired
            onChange={(e) => {
              e.preventDefault();
              handleField({
                is: "type",
                value: e.target.value,
                index,
              });
            }}
          >
            {Object.entries($t("ELEMENTS")).map(([key, value]) => (
              <option value={key} key={key}>
                {value}
              </option>
            ))}
          </Select>
        </FormControl>
      </GridItem>
      <GridItem>
        <FormLabel></FormLabel>
        <Flex flex="1" width="100%" justifyContent="flex-end">
          <IconButton
            mt={6}
            size="lg"
            aria-label="Search database"
            icon={<FiMinus />}
            onClick={() => handleRemoveField(index)}
          />
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default Field;