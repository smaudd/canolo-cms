import React, { ReactElement } from "react";
import {
  ModalOverlay,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
} from "@chakra-ui/react";

interface Props {
  children: ReactElement;
  isOpen: boolean;
  headerLabel: string;
  size?: string;
  cancellable?: boolean;
  onClose?: onClose;
}

interface onClose {
  (): void;
}

export default function Overlay({
  children,
  isOpen,
  headerLabel,
  onClose = () => {},
  size = "full",
  cancellable = true,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered closeOnOverlayClick={!cancellable}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{headerLabel}</ModalHeader>
        <ModalCloseButton disabled={cancellable} />
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
