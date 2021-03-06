import React, {
  FormEvent,
  ReactElement,
  useState,
} from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Flex,
  IconButton,
  Wrap,
  WrapItem,
  Heading,
  Box,
  Divider,
  GridItem,
  Grid,
} from "@chakra-ui/react";
import ModuleField from "components/ModuleField";
import { FiPlus } from "react-icons/fi";
import { $t } from "store/TranslationsContext";
import { createSchema } from "utils/adapter";
import { Field as FieldInterface } from "interfaces/declarations";
import { useNavigate } from "@reach/router";
import Button from "components/Button";

const itemStyles = {
  background: "white",
  p: 4,
  borderRadius: 5,
  width: "100%",
};

interface Props {
  initialState: State;
  type: string;
  onDelete?: any;
  isEdit?: boolean;
}

interface State {
  name: string;
  alias: string;
  id?: string | number | null;
  fields: {
    name: string;
    type: string;
    alias: string;
    order: number;
  }[];
}

const ModuleForm = ({
  initialState,
  type,
  onDelete,
}: Props): ReactElement => {
  const FIELDS = $t("FIELDS");
  const [schema, setSchema] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleAddField = () => {
    setSchema((current: any) => {
      const next = [...current.fields, { name: "", type: "", alias: "" }];
      return {
        ...current,
        fields: next,
      };
    });
  };
  const handleField = ({
    is,
    value,
    index,
  }: {
    is: string;
    value: string;
    index: number;
  }): void => {
    const field: any = schema.fields[index];
    field[is] = value;
    const next = [...schema.fields];
    next[index] = field;
    setSchema({ ...schema, fields: next });
  };
  const handleRemoveField = (index: number) => {
    setSchema((current: State) => {
      if (current.fields.length > 1) {
        return {
          ...current,
          fields: current.fields.filter((_: any, i: number) => i !== index),
        };
      }
      return current;
    });
  };
  const handleChangeSchemaName = ({ target }: { target: HTMLInputElement }) => {
    setSchema((schema) => {
      const next = { ...schema };
      next.name = target.value;
      return next;
    });
  };
  const handleChangeAlias = ({ target }: { target: HTMLInputElement }) => {
    setSchema((schema) => {
      const next = { ...schema };
      next.alias = target.value;
      return next;
    });
  };
  async function handleSubmit(e: FormEvent) {
    setLoading(true);
    e.preventDefault();
    e.stopPropagation();
    await createSchema(schema, schema.id);
    setLoading(false);
    navigate("/dashboard/modules");
  }
  return (
    <form onSubmit={handleSubmit}>
      <Wrap>
        <WrapItem {...itemStyles}>
          <Grid
            templateColumns={["1fr", "repeat(2, 1fr)"]}
            gap={5}
            width="100%"
          >
            <GridItem>
              <FormControl isRequired width="100%">
                <FormLabel>{$t("MODULE_NAME")}</FormLabel>
                <Input
                  size="lg"
                  type="text"
                  isRequired
                  autoComplete="false"
                  value={schema.name}
                  pattern="^[ A-Za-z0-9_@./#&+-]*$"
                  onChange={handleChangeSchemaName}
                />
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl isRequired width="100%">
                <FormLabel>{$t("ALIAS")}</FormLabel>
                <Input
                  size="lg"
                  type="text"
                  isRequired
                  autoComplete="false"
                  value={schema.alias}
                  onChange={handleChangeAlias}
                />
              </FormControl>
            </GridItem>
          </Grid>
        </WrapItem>
        <WrapItem {...itemStyles} display="flex" flexDirection="column">
          <Heading as="h4" size="md" mb={4}>
            {FIELDS}
          </Heading>
          {schema.fields
            .sort((a, b) => a.order - b.order)
            .map((field: FieldInterface, index: number) => (
              <Box width="100%" key={index}>
                <ModuleField
                  handleField={handleField}
                  handleRemoveField={handleRemoveField}
                  index={index}
                  fields={schema.fields}
                  {...field}
                />
                <Divider my={5} />
              </Box>
            ))}
        </WrapItem>
        <WrapItem {...itemStyles}>
          <Flex justifyContent="space-between" alignItems="center" flex="1">
            <IconButton
              size="lg"
              aria-label={$t("ADD_FIELD")}
              icon={<FiPlus />}
              onClick={handleAddField}
            />
            <Flex>
              {schema.id && (
                <Button
                  type="button"
                  label={$t("DELETE")}
                  mr={2}
                  colorScheme="red"
                  onClick={onDelete}
                ></Button>
              )}
              <Button
                type="submit"
                label={type === "new" ? $t("CREATE") : $t("UPDATE")}
                loading={loading}
                disabled={schema.fields.length === 0 || schema.name === ""}
              ></Button>
            </Flex>
          </Flex>
        </WrapItem>
      </Wrap>
    </form>
  );
};

export default ModuleForm;
